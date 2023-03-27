// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs').promises;


async function main() {
  // Creates a client
  const bigqueryClient = new BigQuery();
  const udf = await fs.readFile("./query/udf.sql", "utf8");
  const normalized_names = await fs.readFile("./query/norm.sql", "utf8");
  const query = `
  ${udf}
  WITH normalized_names AS
  (
    ${normalized_names}
    AND (is_1_9_0_error = 1 OR is_norm_diff = 1)
   )
   ,registration_periods AS (
    SELECT 
      CASE WHEN cost_usd - base_cost_usd > 5  THEN (cost_usd - base_cost_usd)  ELSE NULL END AS premium_usd,
      CASE WHEN cost_usd - base_cost_usd > 5  THEN ((cost_usd - base_cost_usd) / ether_price)  ELSE NULL END AS premium_eth,
      *
    FROM (
      SELECT labelhash,
      label,
      event_timestamp,
      start_time,
      end_time,
      cost,
      cost * ether_price as cost_usd,
      CASE WHEN character_length(label) = 3 THEN 0.000020294266869609 WHEN character_length(label) = 4 THEN 0.000005073566717402 ELSE 0.000000158548959919 END * TIMESTAMP_DIFF(end_time, start_time, SECOND) AS base_cost_usd,
      ether_price,
      event,
      FROM \`ens-manager.registrations.registration_periods\`
    ))
   
--     select count(*), sum(base_cost_usd) as sum_base_cost_usd, sum(cost_usd) as sum_cost_usd, sum(premium_usd) as sum_premium_usd, sum(premium_eth) as sum_premium_eth
--     from (
        select registration_periods.label as label, registration_periods.labelhash as labelhash, registration_periods.start_time as start_time, registration_periods.end_time as end_time,registration_periods.ether_price as ether_price, base_cost_usd, cost_usd, premium_usd, premium_eth from registration_periods 
        right join normalized_names on registration_periods.labelhash = normalized_names.labelhash
        where premium_usd is not null    
--     )

   `

  console.log({query})
  // Create the dataset
  const result = await bigqueryClient.query(query);
  await fs.writeFile("./data/premiums.json", JSON.stringify(result),{
    encoding: "utf8",
    flag: "w"
  } );
  console.log(result);
}
main();
