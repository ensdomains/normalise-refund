CREATE TEMP FUNCTION is_invis_spoof(arg1 STRING)
RETURNS BOOL
LANGUAGE js
  OPTIONS (
    library=['gs://jsassets/ens-normalize-1-9-0.js'])
AS r"""
  try{
    return is_invis_spoof(arg1)
  }catch(e){
    return null;
  }
""";

CREATE TEMP FUNCTION ens_normalize(arg1 STRING)
RETURNS STRING
LANGUAGE js
  OPTIONS (
    library=['gs://jsassets/ens-normalize-1-9-0.js'])
AS r"""
  try{
    return ens_normalize(arg1)
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

CREATE TEMP FUNCTION LABELHASH_TO_TOKEN_ID(labelhash STRING)
RETURNS STRING
LANGUAGE js
  OPTIONS (
    library=["gs://blockchain-etl-bigquery/ethers.js"])
AS r"""
    try{
      return BigInt(labelhash);
    }catch(e){
      return `ERROR`;
    }
    
""";

