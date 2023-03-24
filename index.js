// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs').promises;

async function main() {
  // Creates a client
  const bigqueryClient = new BigQuery();
  const udf = await fs.readFile("./udf.sql", "utf8");
  const normalized_names = await fs.readFile("./norm.sql", "utf8");
  const refunds = await fs.readFile("./refund.sql", "utf8");
  const query = `
  ${udf}
  WITH normalized_names AS
  (${normalized_names})
  , refunds AS (
    ${refunds}
  )
  select * from refunds
  `

  console.log({query})
  // Create the dataset
  const result = await bigqueryClient.query(query);
  await fs.writeFile("./result.json", JSON.stringify(result),{
    encoding: "utf8",
    flag: "w"
  } );
  console.log(result);
}
main();
