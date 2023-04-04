// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs').promises;


async function main() {
  // Creates a client
  const bigqueryClient = new BigQuery();
  const udf = await fs.readFile("./query/udf.sql", "utf8");
  const norm = await fs.readFile("./query/norm.sql", "utf8");
  const query = `
  ${udf}
  WITH 
  ${norm}

  select
  count(*) as total,
  sum(is_1_9_0_error) as total_1_9_0_error,
  sum(is_norm_diff) as total_norm_diff,
  sum(has_invis_spoof) as total_invis_spoof
  from norm
  where (is_1_9_0_error = 1 OR is_norm_diff = 1)
  `

  console.log({query})
  // Create the dataset
  await fs.writeFile("./data/all_names_summary.sql", query,{
    encoding: "utf8",
    flag: "w"
  } );
  const result = (await bigqueryClient.query(query))[0];
  console.log({result});
  const header = Object.keys(result[0])
  await fs.writeFile("./data/all_names_summary.csv", header.join(",") + "\n",{
    encoding: "utf8",
    flag: "w"
  } );
  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    const body = Object.values(element)
    await fs.appendFile('./data/all_names_summary.csv', body.join(",") + "\n");  
  }

}
main();
