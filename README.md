# Normalise refund

## Prerequisite

You need to have [access](https://codelabs.developers.google.com/codelabs/cloud-bigquery-python#4) to the following big query table and google storage

- bigquery-public-data.crypto_ethereum.transactions
- bigquery-public-data.crypto_ethereum.token_transfers
- ens-manager.registrations.registration_periods_view
- ens-manager.airdrop.int_str_to_hash
- gs://jsassets/ens-normalize-1-9-0.js
- gs://jsassets/eth-ens-namehash-2-0-15.js

## Scripts

- refund_summary.js = Gives the summary of breakdown of the names to be refunded
- refund_addresses.js = This includes all the refund candidate addresses with number of names they own, sum of premium, gas, and fee (in 3 different options)
- refund_names.js = The breakdown of refund_address for each name the address own with the etherscan url to inspect the history of the name
- refund_names_w_events.js = Dump the register/refund/renew history of all refund eligible names
- all_names.js = All unexpired names detailing whether the name is valid or not in old and new noarmalise functions. To be eligible for the refund either “is_1_9_0_error” is 1 or “is_norm_diff” is set to 1

Most scripts create .sql for the generated query and .csv/.json output files under `/dir`

## Query examples

You can use [jq](https://stedolan.github.io/jq/) to query the json file

eg: find out all events under `ᴇᴛʜᴇʀᴇᴜᴍ`

```
cat refund_names_w_events.json | jq '.[0][] | select(.fulllabel == "ᴇᴛʜᴇʀᴇᴜᴍ")| {labelhash,tokenid,"time":.event_timestamp.value, gas_spent, event, last_owner, transactionhash}'
```

eg: sort by total gas spent

```
cat refund_names.json | jq '.[0] | sort_by(.total_gas_spent)'
```
