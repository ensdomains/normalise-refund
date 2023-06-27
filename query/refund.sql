w_term_number as (
  select sum(start_period) 
    OVER (
      PARTITION BY labelhash
      ORDER BY event_timestamp, event_priority            
      ROWS BETWEEN unbounded preceding AND current row
  ) AS term_number,
  FIRST_VALUE(label IGNORE NULLS) OVER ( 
      PARTITION BY labelhash
      ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
  ) as fulllabel,
  FIRST_VALUE(owner IGNORE NULLS) OVER ( 
    PARTITION BY labelhash
    ORDER BY event_timestamp desc, log_index desc range between unbounded preceding and unbounded following
  ) as last_owner,
  * from events
  order by labelhash,event_timestamp asc, start_period asc
),
w_last_term as (
  select max(term_number) over (partition by labelhash order by term_number desc) as last_term, * from w_term_number
)
, w_duration as (
select
DATE_DIFF(CAST(max(end_time) OVER (PARTITION BY labelhash) as DATE), CAST(TIMESTAMP("2023-06-18 04:50:00+00") as DATE), DAY) as remaining,
max(start_time) OVER ( PARTITION BY labelhash) as max_start_time,
DATE_DIFF(max(end_time) OVER ( PARTITION BY labelhash), max(start_time) OVER ( PARTITION BY labelhash),DAY) as max_start_duration,
DATE_DIFF(max(end_time) OVER ( PARTITION BY labelhash), min(start_time) OVER ( PARTITION BY labelhash), DAY) as duration,
sum(base_cost) OVER ( 
    PARTITION BY labelhash
) as total_cost,
FIRST_VALUE(base_cost IGNORE NULLS) OVER ( 
    PARTITION BY labelhash ORDER BY event_timestamp desc range between unbounded preceding and unbounded following
) as last_cost,
*
from w_last_term
where term_number = last_term
AND last_owner != '0x000000000000000000000000000000000000dead'
order by event_timestamp,event_priority
)
, refund as (
select
ROW_NUMBER() OVER(PARTITION BY labelhash ORDER BY event_timestamp asc, event_priority asc) as RANK,
last_cost * (remaining / max_start_duration) as last_remmaining_cost,
total_cost * (remaining / duration) as total_remmaining_cost,
sum(gas_spent) OVER( PARTITION BY labelhash) as total_gas_spent,
* from w_duration order by event_timestamp,event_priority
)
