CREATE TEMP FUNCTION ens_normalize(arg1 STRING)
RETURNS STRING
LANGUAGE js
  OPTIONS (
    library=['gs://jsassets/ens-normalize.js'])
AS r"""
  try{
    return ens_normalize(arg1)
  }catch(e){
    return null;
  }
""";


CREATE TEMP FUNCTION eth_ens_namehash_2_0_8(arg1 STRING)
RETURNS STRING
LANGUAGE js
  OPTIONS (
    library=['gs://jsassets/eth-ens-namehash-2-0-8.js'])
AS r"""
  try{
    return eth_ens_namehash_2_0_8(arg1)
  }catch(e){
        return null;
  }

""";

CREATE TEMP FUNCTION eth_ens_namehash_2_0_15(arg1 STRING)
RETURNS STRING
LANGUAGE js
  OPTIONS (
    library=['gs://jsassets/eth-ens-namehash-2-0-15.js'])
AS r"""
  try{
    return eth_ens_namehash_2_0_15(arg1)
  }catch(e){
        return null;
  }

""";

CREATE TEMP FUNCTION NAME_TO_LABELHASH(name STRING)
RETURNS STRING
LANGUAGE js
  OPTIONS (
    library=["gs://blockchain-etl-bigquery/ethers.js"])
AS r"""
    var utils = ethers.utils;
    var labelHash
    if(name === null) return '';
    try{
      return utils.keccak256(utils.toUtf8Bytes(name));
    }catch(e){
      return null
    }
    
""";


WITH Example AS
 (SELECT '50' as label UNION ALL
  SELECT  null  UNION ALL
  SELECT  '' UNION ALL
  SELECT  '–brokensea' UNION ALL --* both ok but  different *--
  SELECT  '۸۸۷۵۴۲'  UNION ALL --* legacy error, new ok *--
  SELECT  '⁕⁕⁕⁕⁕'  UNION ALL --* legacy error, new ok *--
  SELECT '🚀‍‍‍‍‍‍‍‍‍‍🚀‍‍‍‍‍‍‍‍‍‍🚀‍‍‍‍‍‍‍‍‍‍') --* legacy ok , new error *--
SELECT label,
  eth_ens_namehash_2_0_8(label) as old_2_0_8,
  LEFT(NAME_TO_LABELHASH(eth_ens_namehash_2_0_8(label)), 5) as old_2_0_8_hash,
  eth_ens_namehash_2_0_15(label) as old_2_0_15,
  LEFT(NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)), 5) as old_2_0_15_hash,
  ens_normalize(label) as new_1_6_4,
  LEFT(NAME_TO_LABELHASH(ens_normalize(label)), 5) as new_1_6_4_hash,
  NAME_TO_LABELHASH(eth_ens_namehash_2_0_15(label)) != NAME_TO_LABELHASH(ens_normalize(label)) AND eth_ens_namehash_2_0_15(label) IS NOT NULL as refund 

FROM Example




