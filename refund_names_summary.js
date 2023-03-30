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
    count(*) as total_addresses,
    sum(user_name) as total_names,
    sum(user_refund) as total_refund,
    sum(user_premium) as total_premium,
    sum(user_cost) as last_remaining_cost,
    sum(total_user_cost) as total_all_cost,
    sum(last_user_cost) as last_all_cost,
    sum(total_gas_spent) as total_gas_spent,
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
