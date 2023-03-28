# Normalise refund

## Scripts

index.js name_history.js norm_test.js

- norm_test.js = Gives the summary of breakdown of the names to be refunded
- name_history.js = Dump the register/refund/renew history of all refund eligible names to `data/name_history.json`
- normalised_names.js = Dump all names to `data/normalised_names.csv`

## Query examples

Extract time, event, and last owner of '†††'

```
cat refund_name_history.json | jq '.[0][] | select(.fulllabel == "🦫‍➡🦫‍➡")| {"time":.event_timestamp.value, gas_spent, event, last_owner, transactionhash}'
```

cat refund_name_history.json | jq '.[0][] | select(.transactionhash == "0x37f3cc8aca3f15366999f2ffe3dbe7769da3dcf11331bf8355e9efa4de63d8d7")| {fulllabel,"time":.event_timestamp.value, gas_spent, event, last_owner, transactionhash} | ( to_entries | map(.value))| @csv'

cat refund_name_history.json | jq '.[0][] | select(.labelhash == "0xf38549b9af39c71928cfcdc5aa267ba98c35e84f425c4ba3b5fdd404530fc9c8")| {"time":.event_timestamp.value, event, last_owner}'

Convert into csv

```
echo "label,tokenid, event_timestamp, event, start_time,end_time, prev_owner, owner, gas_spent, cost, total_cost, total_remmaining, last_cost, last_remmaining, base_cost_usd, premium_usd,premium_eth,last_owner, transactionhash" > refund_name_history.csv
cat refund_name_history.json | jq '.[0] | sort_by(.total_cost)[] | select(.RANK == 1) | {fulllabel, tokenid,"event_timestamp":.event_timestamp.value,event,"start_time":.start_time.value,"end_time":.end_time.value, prev_owner, owner, gas_spent, cost, total_cost, total_remmaining, last_cost, last_remmaining, base_cost_usd, premium_usd,premium_eth,last_owner, transactionhash } | ( to_entries | map(.value))| @csv' >> refund_name_history.csv
```

Find if 'matoken' gets refund

```
egrep 'old_hash|matoken' normalised_names.csv

label,old_hash,new_hash,labelhash,is_oldhash,is_newhash,is_neither,is_both,is_same,is_diff,is_1_9_0_error,is_2_0_15_error,is_both_error,is_norm_diff,is_refund,max_end_date
matoken,0x9a6b19d66c72821c837920cb3943a59b5f136ee9e4842a7a1b6d2e97e0a5f0bf,0x9a6b19d66c72821c837920cb3943a59b5f136ee9e4842a7a1b6d2e97e0a5f0bf,0x9a6b19d66c72821c837920cb3943a59b5f136ee9e4842a7a1b6d2e97e0a5f0bf,1,1,0,1,1,0,0,0,0,0,0,2027-05-04T16:44:24.000Z
```

In the above result, is_refund is 0 hence not getting any return
