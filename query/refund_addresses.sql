refund_addresses AS (
  select
  last_owner,
  count(fulllabel) as user_name,
  sum(premium) as user_premium,
  sum(last_remmaining_cost) as user_last_remmaining_cost,
  sum(total_cost) as user_total_cost,
  sum(last_cost) as user_last_cost,
  sum(total_gas_spent) as user_total_gas_spent from (
    select fulllabel,
    max(last_owner) as last_owner, 
    max(IFNULL(premium, 0)) as premium,
    max(IFNULL(last_remmaining_cost, 0)) as last_remmaining_cost,
    max(IFNULL(total_cost, 0)) as total_cost,
    max(IFNULL(last_cost, 0)) as last_cost,
    max(IFNULL(total_gas_spent, 0)) as total_gas_spent,
    from refund group by fulllabel  
  )  group by last_owner
)