// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs').promises;
// ᴇᴛʜᴇʀᴇᴜᴍ
const labelhash = '0x021218b8e35bf318f4a3fc540a1ab99ad60948c67c20fa923f1975a26c8c8df3'
async function main() {
  // Creates a client
  const bigqueryClient = new BigQuery();
  const udf = await fs.readFile("./query/udf.sql", "utf8");
  const norm = await fs.readFile("./query/norm.sql", "utf8");
  const norm_w_refund = await fs.readFile("./query/norm_w_refund.sql", "utf8");
  const query = `
  ${udf}
  WITH
  ${norm},
  ${norm_w_refund}
    select
    total_cost * (remaining / duration) as total_remmaining,
    last_cost * (remaining / max_start_duration) as last_remmaining,
    *
    FROM (
        select
        ROW_NUMBER() OVER(PARTITION BY label ORDER BY block_number desc, event_priority desc) as RANK,
        FIRST_VALUE(label IGNORE NULLS) OVER ( 
            PARTITION BY labelhash
            ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
        ) as fulllabel,
        FIRST_VALUE(owner IGNORE NULLS) OVER ( 
            PARTITION BY labelhash
            ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
        ) as last_owner,
        min(start_time) OVER ( 
            PARTITION BY labelhash
        ) as min_start_time,
        max(start_time) OVER ( 
            PARTITION BY labelhash
        ) as max_start_time,
        max(end_time) OVER ( 
            PARTITION BY labelhash
        ) as max_end_time,
        DATE_DIFF(
        max(end_time) OVER ( 
            PARTITION BY labelhash
        ),
        min(start_time) OVER ( 
            PARTITION BY labelhash
        ), DAY
        )
        as duration,
        DATE_DIFF(
        max(end_time) OVER ( 
            PARTITION BY labelhash
        ),
        max(start_time) OVER ( 
            PARTITION BY labelhash
        ), DAY
        )
        as max_start_duration,
      
        DATE_DIFF(
          CAST(max(end_time) OVER (PARTITION BY labelhash) as DATE),
          CAST(CURRENT_DATE() as DATE), DAY
        ) as remaining,
        sum(cost) OVER ( 
            PARTITION BY labelhash
        ) as total_cost,
        FIRST_VALUE(cost IGNORE NULLS) OVER ( 
            PARTITION BY labelhash ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
        ) as last_cost,        
        sum(gas_spent) OVER ( 
            PARTITION BY labelhash
        ) as total_gas_spent,

        * from (
          select
          transactions.hash as transactionhash, labelhash, tokenid, label, registration_periods.event_timestamp, start_time, end_time, registration_periods.event, prev_owner, owner, transactions.block_number, transactions.transaction_index,
          SAFE_DIVIDE(transactions.receipt_gas_used * transactions.gas_price, 1000000000000000000) as gas_spent,
          cost, cost_usd, base_cost_usd, ether_price,
          CASE WHEN cost_usd - base_cost_usd > 5  THEN (cost_usd - base_cost_usd)  ELSE NULL END AS premium_usd,
          CASE WHEN cost_usd - base_cost_usd > 5  THEN ((cost_usd - base_cost_usd) / ether_price)  ELSE NULL END AS premium_eth,
          term_number,
          last_term, event_priority from (
            select max(term_number) over (partition by labelhash order by term_number desc) as last_term, *
            from (
              select 
                sum(start_period) 
                  OVER (
                    PARTITION BY labelhash
                    ORDER BY event_timestamp            
                    ROWS BETWEEN unbounded preceding AND current row
                ) AS term_number, *
              from (
                select IF(event = 'registered' OR event = 'migrated', 1 , null) as start_period,
                labelhash, label, LABELHASH_TO_TOKEN_ID(labelhash) as tokenid, transaction_hash, event_timestamp, start_time, end_time, event,1 as event_priority, null as prev_owner, null as owner,
                cost,
                cost * ether_price as cost_usd,
                CASE WHEN character_length(label) = 3 THEN 0.000020294266869609 WHEN character_length(label) = 4 THEN 0.000005073566717402 ELSE 0.000000158548959919 END * TIMESTAMP_DIFF(end_time, start_time, SECOND) AS base_cost_usd,
                ether_price,  
                from  \`ens-manager.registrations.registration_periods_view\` registration_periods
                where labelhash in (select distinct(labelhash) from norm_w_refund)
                UNION ALL 
                select null as start_period,
                \`ens-manager.airdrop.int_str_to_hash\`(value) AS labelhash, null as label, value as tokenid, transaction_hash, block_timestamp as event_timestamp, null as start_time, null as end_time, 'transfer' as event, 2 as event_priority, from_address as prev_owner, to_address as owner,
                null as cost, null as cost_usd, null as base_cost_usd, null as ether_price,
                FROM  \`bigquery-public-data.crypto_ethereum.token_transfers\` WHERE  token_address = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"
                AND value in (select distinct(LABELHASH_TO_TOKEN_ID(labelhash)) from norm_w_refund)
              )     
            )
          ) as registration_periods
          LEFT JOIN \`bigquery-public-data.crypto_ethereum.transactions\` as transactions ON registration_periods.transaction_hash = transactions.hash
          WHERE last_term = term_number
        )
    ) ORDER BY block_number asc, event_priority  asc
  `

  console.log({query})
  // Create the dataset
  await fs.writeFile("./data/refund_name_history.sql", query,{
    encoding: "utf8",
    flag: "w"
  } );
  const result = await bigqueryClient.query(query);
  await fs.writeFile("./data/refund_name_history.json", JSON.stringify(result),{
    encoding: "utf8",
    flag: "w"
  } );
  console.log(result);
}
main();
