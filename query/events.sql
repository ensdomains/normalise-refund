events_wo_premium AS(
select IF(event = 'registered' OR event = 'migrated', 1 , null) as start_period,
labelhash, label, LABELHASH_TO_TOKEN_ID(labelhash) as tokenid, transaction_hash,
event_timestamp,
log_index,
start_time, end_time, event,1 as event_priority, null as prev_owner, null as owner,
cost,
cost * ether_price as cost_usd,
CASE WHEN character_length(label) = 3 THEN 0.000020294266869609 WHEN character_length(label) = 4 THEN 0.000005073566717402 ELSE 0.000000158548959919 END * TIMESTAMP_DIFF(end_time, start_time, SECOND) AS base_cost_usd,
ether_price,  
from  `ens-manager.registrations.registration_periods_view` registration_periods
where labelhash in (select distinct(labelhash) from norm_w_refund)
UNION ALL 
select null as start_period,
`ens-manager.airdrop.int_str_to_hash`(value) AS labelhash, null as label, value as tokenid, transaction_hash, block_timestamp as event_timestamp,
log_index
, null as start_time, null as end_time, 'transfer' as event, 2 as event_priority, from_address as prev_owner, to_address as owner,
null as cost, null as cost_usd, null as base_cost_usd, null as ether_price,
FROM `bigquery-public-data.crypto_ethereum.token_transfers` as token_transfers WHERE  token_address = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"
AND value in (select distinct(LABELHASH_TO_TOKEN_ID(labelhash)) from norm_w_refund ORDER BY token_transfers.block_number, token_transfers.log_index)
),
events_with_gas_used as (
    select events_wo_premium.*,
    CASE
    -- last 1 month average from https://dune.com/queries/6482/12871
    WHEN event = 'registered' THEN 45740 + 253150
    WHEN event = 'renewed' THEN 90354
    ELSE 0
    END as gas_used,
    transactions.gas_price
    from events_wo_premium
    left join `bigquery-public-data.crypto_ethereum.transactions` as transactions
    on events_wo_premium.transaction_hash = transactions.hash
),
events as (
    select
    CASE WHEN cost_usd - base_cost_usd > 5  THEN (cost_usd - base_cost_usd)  ELSE NULL END AS premium_usd,
    CASE WHEN cost_usd - base_cost_usd > 5  THEN ((cost_usd - base_cost_usd) / ether_price)  ELSE NULL END AS premium,
    base_cost_usd / ether_price as base_cost,
    SAFE_DIVIDE(gas_used * gas_price, 1000000000000000000) as gas_spent,
    * from events_with_gas_used
)