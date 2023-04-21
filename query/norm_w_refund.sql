norm_w_refund AS
(
select * from norm
where (is_1_9_0_error = 1 OR is_norm_diff = 1) AND has_invis_spoof = 0
AND NOT REGEXP_CONTAINS(label, r'\.')
)