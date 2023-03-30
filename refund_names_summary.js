// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');

const fs = require('fs').promises;

// ᴇᴛʜᴇʀᴇᴜᴍ
async function main() {
  // Creates a client
  const bigqueryClient = new BigQuery();
  const udf = await fs.readFile("./query/udf.sql", "utf8");
  const norm = await fs.readFile("./query/norm.sql", "utf8");
  const norm_w_refund = await fs.readFile("./query/norm_w_refund.sql", "utf8");
  const events = await fs.readFile("./query/events.sql", "utf8");
  const refund = await fs.readFile("./query/refund.sql", "utf8");
  const refund_addresses = await fs.readFile("./query/refund_addresses.sql", "utf8");
  const query = `
  ${udf}
  WITH
  ${norm},
  ${norm_w_refund},
  ${events},
  ${refund},
  ${refund_addresses}
  select
    count(*) as all_addresses,
    sum(user_name) as all_names,
    sum(user_premium) as all_premium,
    sum(user_last_remmaining_cost) as all_last_remaining_cost,
    sum(user_total_cost) as all_total_cost,
    sum(user_last_cost) as all_last_cost,
    sum(user_total_gas_spent) as all_gas_spent,
  from refund_addresses
  `

  console.log({query})
  // Create the dataset
  await fs.writeFile("./data/refund_names_summary.sql", query,{
    encoding: "utf8",
    flag: "w"
  } );
  const result = await bigqueryClient.query(query);
  console.log(result);
}
main();
