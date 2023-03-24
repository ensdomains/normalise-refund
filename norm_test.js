// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs').promises;


async function main() {
  // Creates a client
  const bigqueryClient = new BigQuery();
  const udf = await fs.readFile("./udf.sql", "utf8");
  const normalized_names = await fs.readFile("./norm.sql", "utf8");
  const query = `
  ${udf}
  WITH normalized_names AS
  (
    ${normalized_names}
    AND (is_1_9_0_error = 1 OR is_norm_diff = 1)
   )

  select
  count(*) as total,
  sum(is_same) as same,
  (
    sum(is_1_9_0_error) +
    sum(is_2_0_15_error) +
    sum(is_both_error) +
    sum(is_norm_diff) 
  ) as different,
  sum(is_1_9_0_error) as is_1_9_0_error,
  sum(is_2_0_15_error) as is_2_0_15_error,
  sum(is_both_error) as is_both_error,
  sum(is_norm_diff) as norm_diff,
  sum(is_1_9_0_error) + sum(is_norm_diff) as refund
  from normalized_names
  `

  console.log({query})
  // Create the dataset
  const result = await bigqueryClient.query(query);
  console.log(result);
}
main();
