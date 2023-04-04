// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const { parseAsync } = require("json2csv")

const fs = require('fs').promises;
const WEI = Math.pow(10, 18)
const options = {
  "option_fee_last_remmaining": [],
  "option_fee_last_all": [],
  "option_fee_all": []
}

// ᴇᴛʜᴇʀᴇᴜᴍ
async function main() {
  // Creates a client
  const data = await fs.readFile("./data/refund_addresses.csv", 'utf-8');
  const rows = data.split(/\r?\n/)
// "address","names","fee_last_remmaining","fee_last_all","fee_all","premium","gas"
// "0x350c8181846e7d12f6a81fc756010f657705cea7",177,0.8999585579581092,1.5557801916349914,1.5557801916349914,0,1.2801176446988536
// "0x4bff094fc253993fae560d025f35a2829507adce",170,0.3392032646505702,0.6762226341655851,0.6762226341655851,0,0.3239364218888078
  for (let i = 1; i < rows.length; i++) {
    const [
      _address,
      _,
      _fee_last_remmaining,
      _fee_last_all,
      _fee_all,
      _premium,
      _gas
    ] = rows[i].split(",");
    let address = _address.replace(/\"/g,'')
    let fee_last_remmaining = parseFloat(_fee_last_remmaining)
    let fee_last_all = parseFloat(_fee_last_all)
    let fee_all = parseFloat(_fee_all)
    let premium = parseFloat(_premium)
    let gas = parseFloat(_gas)

    let fee_last_remmaining_wei = WEI * fee_last_remmaining
    let fee_last_all_wei = WEI * fee_last_all
    let fee_all_wei = WEI * fee_all
    let premium_wei = WEI * premium
    let gas_wei = WEI * gas

    let option_fee_last_remmaining =  [address, fee_last_remmaining + premium + gas]
    let option_fee_last_all =  [address, fee_last_all + premium + gas]
    let option_fee_all =  [address, fee_all + premium + gas]

    let option_fee_last_remmaining_wei =  [address, fee_last_remmaining_wei + premium_wei + gas_wei]
    let option_fee_last_all_wei =  [address, fee_last_all_wei + premium_wei + gas_wei]
    let option_fee_all_wei =  [address, fee_all_wei + premium_wei + gas_wei]

    console.log(
      {
        address,
        fee_last_remmaining,fee_last_all,fee_all, premium , gas,
        option_fee_last_remmaining,option_fee_last_all,option_fee_all,
        option_fee_last_remmaining_wei,option_fee_last_all_wei,option_fee_all_wei
      }
    )
    options["option_fee_last_remmaining"].push(option_fee_last_remmaining_wei)
    options["option_fee_last_all"].push(option_fee_last_all_wei)
    options["option_fee_all"].push(option_fee_all_wei)
  }
  // const result = await bigqueryClient.query(query);
  for (const key in options) {
    if (Object.hasOwnProperty.call(options, key)) {
      const option = options[key];
      const csv = option.map(c => c.join(',')).join('\n')
      await fs.writeFile(`./data/refund_addresses_options_${key}.csv`, csv, { encoding: "utf-8", flag:"w" })              
    }
  }

}
main();
