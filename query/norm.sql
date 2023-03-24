  select 
    label,
    NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) as old_hash,
    NAME_TO_LABELHASH(ens_normalize(label)) as new_hash,
    labelhash,
    IF((NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) = labelhash), 1, 0) as is_oldhash,
    IF((NAME_TO_LABELHASH(ens_normalize(label)) = labelhash), 1, 0) as is_newhash,
    IF((NAME_TO_LABELHASH(ens_normalize(label)) != labelhash AND NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) != labelhash ), 1, 0) as is_neither,
    IF((NAME_TO_LABELHASH(ens_normalize(label)) = labelhash AND NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) = labelhash ), 1, 0) as is_both,
    IF((eth_ens_namehash_2_0_15(label) = ens_normalize(label)), 1, 0) as is_same,
    IF((eth_ens_namehash_2_0_15(label) != ens_normalize(label)), 1, 0) as is_diff,
    IF((NAME_TO_LABELHASH(ens_normalize(label)) = '') AND (NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) != '') , 1, 0) as is_1_9_0_error,
    IF((NAME_TO_LABELHASH(ens_normalize(label)) != '') AND (NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) = '') , 1, 0) as is_2_0_15_error,
    IF((NAME_TO_LABELHASH(ens_normalize(label)) = '') AND (NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) = '') , 1, 0) as is_both_error,
    IF(
      (
        NAME_TO_LABELHASH(ens_normalize(label)) != '' AND
        NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) != '' AND
        NAME_TO_LABELHASH(ens_normalize(label)) != NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label))
      )
      , 1, 0) as is_norm_diff
    ,
    IF(
      ( /* 1.9.0 error */
        (NAME_TO_LABELHASH(ens_normalize(label)) = '') AND (NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) != '')
      ) OR
      ( /* norm diff */
        NAME_TO_LABELHASH(ens_normalize(label)) != '' AND
        NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) != '' AND
        NAME_TO_LABELHASH(ens_normalize(label)) != NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label))
      )
    , 1, 0) as is_refund,
    max(end_time) AS max_end_date
    -- max(end_time) OVER(PARTITION BY labelhash) AS max_end_date,
  from  `ens-manager.registrations.registration_periods`
  -- WHERE event_timestamp < TIMESTAMP("2023-02-26 22:56:27+00")
  group by label, labelhash
  -- having max_end_date > DATE_ADD(TIMESTAMP("2023-02-26 22:56:27+00"), INTERVAL -90 DAY)
  having CAST(max_end_date as DATE) > CAST(CURRENT_DATE() as DATE)
