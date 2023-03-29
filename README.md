# Normalise refund

## Scripts

- refund_summary.js = Gives the summary of breakdown of the names to be refunded
- refund_names.js = Gives the refund names with refund amount
- refund_names_w_amount.js = Gives the refund names without refund amount
- refund_names_w_events.js = Dump the register/refund/renew history of all refund eligible names
- all_names.js = All unexpired names detailing whether the name is valid or not in old and new noarmalise functions

Test names
many transfers = bıtcoın (0x50bfa918de6cf0ccfe65948434bf6cd7b7611d1d2615d73387a6147e139efc85, 36523662741629454419076309693005023762212369665798328222305373336290730114181)
premium =

⛹🏽‍♂‍⬅ (0x333457e5d15fab0ee8733c48ea94a02e9ccd27ebc0d7030f9f5d4f191d1a1eb5, 23160437972924643920673367502987984220746938364579825978022004595789661871797)

## Query examples

Extract time, event, and last owner of '†††'

cat refund_names_w_events.json | jq '.[0][] | select(.fulllabel == "ᴇᴛʜᴇʀᴇᴜᴍ")| {labelhash,tokenid,"time":.event_timestamp.value, gas_spent, event, last_owner, transactionhash}'

```
cat refund_names_w_events.json | jq '.[0][] | select(.labelhash == "0x333457e5d15fab0ee8733c48ea94a02e9ccd27ebc0d7030f9f5d4f191d1a1eb5")| {labelhash, tokenid,"time":.event_timestamp.value, gas_spent, event, last_owner, transactionhash}'
```

```
cat refund_names.json | jq '.[0][] | select(.labelhash == "0xf08e0dc36cb4a9805523811c4b61351551a18cabf26db9bc9937d35d9ab72917")| {labelhash, tokenid,"time":.event_timestamp.value, gas_spent, event, last_owner, transactionhash}'
```

cat refund_name_history.json | jq '.[0][] | select(.transactionhash == "0x37f3cc8aca3f15366999f2ffe3dbe7769da3dcf11331bf8355e9efa4de63d8d7")| {fulllabel,"time":.event_timestamp.value, gas_spent, event, last_owner, transactionhash} | ( to_entries | map(.value))| @csv'

cat refund_name_history.json | jq '.[0][] | select(.labelhash == "0xf38549b9af39c71928cfcdc5aa267ba98c35e84f425c4ba3b5fdd404530fc9c8")| {"time":.event_timestamp.value, event, last_owner}'

Convert into csv

```
echo "label,tokenid, event_timestamp, event, start_time,end_time, prev_owner, owner, gas_spent, cost, total_cost, total_remmaining, last_cost, last_remmaining, base_cost_usd, premium_usd,premium_eth,last_owner, transactionhash" > refund_name_history.csv
cat refund_name_history.json | jq '.[0] | sort_by(.total_cost)[] | select(.RANK == 1) | {fulllabel, tokenid,"event_timestamp":.event_timestamp.value,event,"start_time":.start_time.value,"end_time":.end_time.value, prev_owner, owner, gas_spent, cost, total_cost, total_remmaining, last_cost, last_remmaining, base_cost_usd, premium_usd,premium_eth,last_owner, transactionhash } | ( to_entries | map(.value))| @csv' >> refund_name_history.csv
```

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
