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
  
  select * from norm
  `

  console.log({query})
  // Create the dataset
  const result = (await bigqueryClient.query(query))[0];
  console.log({result});
  const header = Object.keys(result[0])
  await fs.writeFile("./data/all_names.csv", header.join(",") + "\n",{
    encoding: "utf8",
    flag: "w"
  } );
  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    const json = JSON.parse(JSON.stringify(element))
    element.max_end_date = json.max_end_date.value
    const body = Object.values(element)
    await fs.appendFile('./data/all_names.csv', body.join(",") + "\n");  
  }

}
main();
