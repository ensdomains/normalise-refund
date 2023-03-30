refund_addresses AS (
  select last_owner, count(fulllabel) as user_name, sum(refund) as user_refund, sum(premium) as user_premium, sum(cost) as user_cost, sum(total_cost) as total_user_cost, sum(last_cost) as last_user_cost from (
    select fulllabel,
    max(last_owner) as last_owner, 
    max(IFNULL(last_premium, 0)) + max(IFNULL(last_remmaining_cost, 0)) as refund, 
    max(IFNULL(last_premium, 0)) as premium,
    max(IFNULL(last_remmaining_cost, 0)) as cost,
    max(IFNULL(total_cost, 0)) as total_cost,
    max(IFNULL(last_cost, 0)) as last_cost,
    from refund group by fulllabel  
  )  group by last_owner
)