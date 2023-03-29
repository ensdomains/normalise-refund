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
  const query = `
  ${udf}
  WITH
  ${norm},
  ${norm_w_refund},
  ${events},
  ${refund}
  select count(*) as total_addresses, sum(user_name) as total_names, sum(user_refund) as total_refund, sum(user_premium) as total_premium, sum(user_cost) as total_cost from (
    select last_owner, count(fulllabel) as user_name, sum(refund) as user_refund, sum(premium) as user_premium, sum(cost) as user_cost from (
      select fulllabel,
      max(last_owner) as last_owner, 
      max(IFNULL(last_premium, 0)) + max(IFNULL(last_remmaining_cost, 0)) as refund, 
      max(IFNULL(last_premium, 0)) as premium,
      max(IFNULL(last_remmaining_cost, 0)) as cost,
      from refund group by fulllabel  
    )  group by last_owner
  )
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
