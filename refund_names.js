// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const { parseAsync } = require("json2csv")

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
  select fulllabel,
  labelhash,
  concat("https://etherscan.io/token/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85?a=", cast(tokenid as string)) as etherscan_url,
  max(last_owner) as last_owner, 
  max(IFNULL(last_remmaining_cost, 0)) as last_remmaining_cost,
  max(IFNULL(last_cost, 0)) as last_cost,
  max(IFNULL(total_cost, 0)) as total_cost,
  max(IFNULL(premium, 0)) as premium,
  max(IFNULL(total_gas_spent, 0)) as total_gas_spent,
  count(*) as transactions from refund group by fulllabel,labelhash,tokenid
  `

  console.log({query})
  // Create the dataset
  await fs.writeFile("./data/refund_names.sql", query,{
    encoding: "utf8",
    flag: "w"
  } );
  const result = await bigqueryClient.query(query);
  const csv = await parseAsync(result[0], {});
  await fs.writeFile("./data/refund_names.csv", csv, { encoding: "utf-8", flag:"w" })
  await fs.writeFile("./data/refund_names.json", JSON.stringify(result),{
    encoding: "utf8",
    flag: "w"
  } );
  console.log(result);
}
main();
