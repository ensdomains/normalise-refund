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
  const refund_addresses = await fs.readFile("./query/refund_addresses.sql", "utf8");

  const query = `
  ${udf}
  WITH
  ${norm},
  ${norm_w_refund},
  ${events},
  ${refund},
  ${refund_addresses}
  select last_owner as owner, user_refund as refund from refund_addresses
  order by user_refund asc
  `

  console.log({query})
  // Create the dataset
  await fs.writeFile("./data/refund_addresses.sql", query,{
    encoding: "utf8",
    flag: "w"
  } );
  const result = await bigqueryClient.query(query);
  const csv = await parseAsync(result[0], {});
  await fs.writeFile("./data/refund_addresses.csv", csv, { encoding: "utf-8", flag:"w" })
  await fs.writeFile("./data/refund_addresses.json", JSON.stringify(result),{
    encoding: "utf8",
    flag: "w"
  } );
  console.log(result);
}
main();
