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
  select * from refund
  `

  console.log({query})
  // Create the dataset
  await fs.writeFile("./data/refund_names_w_events.sql", query,{
    encoding: "utf8",
    flag: "w"
  } );
  const result = await bigqueryClient.query(query);
  await fs.writeFile("./data/refund_names_w_events.json", JSON.stringify(result),{
    encoding: "utf8",
    flag: "w"
  } );
  console.log(result);
}
main();
