select label,
total_cost as a_total_cost,
total_cost * (remaining / duration) as b_total_remmaining,
last_cost as e_last_cost,
last_cost * (remaining / max_start_duration) as f_last_remmaining,
FROM (
  select 
  FIRST_VALUE(label IGNORE NULLS) OVER ( 
      PARTITION BY labelhash
      ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
  ) as label,
  FIRST_VALUE(owner IGNORE NULLS) OVER ( 
      PARTITION BY labelhash
      ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
  ) as last_owner,
  start_time, end_time,
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

  event_timestamp, event, gas_spent, cost, prev_owner, owner,

  sum(cost) OVER ( 
    PARTITION BY labelhash
  ) as total_cost,

  FIRST_VALUE(cost IGNORE NULLS) OVER ( 
    PARTITION BY labelhash ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
  ) as last_cost,

  sum(gas_spent) OVER ( 
      PARTITION BY labelhash
  ) as total_gas_spent

  from(
    select labelhash, label, registration_periods.event_timestamp, start_time, end_time, registration_periods.event, prev_owner, owner, transactions.block_number, transactions.transaction_index, SAFE_DIVIDE(transactions.receipt_gas_used * transactions.gas_price, 1000000000000000000) as gas_spent, cost from (
    select labelhash, label, LABELHASH_TO_TOKEN_ID(labelhash) as tokenid, transaction_hash, event_timestamp, start_time, end_time, event, null as prev_owner, null as owner, cost from  `ens-manager.registrations.registration_periods_view` registration_periods
    where labelhash in (select distinct(labelhash) from normalized_names)
    UNION ALL 
    select `ens-manager.airdrop.int_str_to_hash`(value) AS labelhash, null as label, value as tokenId, transaction_hash, block_timestamp as event_timestamp, null as start_time, null as end_time, 'transfer' as event, from_address as prev_owner, to_address as owner, null as cost FROM  `bigquery-public-data.crypto_ethereum.token_transfers` WHERE  token_address = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"
    AND value in (select distinct(LABELHASH_TO_TOKEN_ID(labelhash)) from normalized_names )
  ) as registration_periods
  LEFT JOIN `bigquery-public-data.crypto_ethereum.transactions` as transactions ON registration_periods.transaction_hash = transactions.hash
  ORDER BY block_number, transaction_index
  )
  ORDER BY event_timestamp
) where label is not null

