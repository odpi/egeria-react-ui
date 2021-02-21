/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const getSecurityInfoFromEnv = () => {
  // capitals as Windows can be case sensitive.
  const env_ca= "EGERIA_PRESENTATIONSERVER_EGERIA_CA";
  const env_pfx= "EGERIA_PRESENTATIONSERVER_EGERIA_PFX";
  const env_pfx_passphrase= "EGERIA_PRESENTATIONSERVER_EGERIA_PFX_PASSPHRASE";
  const env_browser_cert= "EGERIA_PRESENTATIONSERVER_EGERIA_BROWSER_CERT";
  const env_browser_passphrase= "EGERIA_PRESENTATIONSERVER_EGERIA_BROWSER_PASSPHRASE";

  const env = process.env;
  console.log("getSecurityInfoFromEnv env_pfx_passphrase");
  console.log(env[env_pfx_passphrase]);
  let modifiableSecurity = {};
  
  for (const envVariable in env) {
    try {
      if (envVariable == env_ca) {
        modifiableSecurity.ca = env[envVariable];
      } else  if (envVariable == env_pfx) {
        modifiableSecurity.pfx = env[envVariable];
      } else  if (envVariable == env_pfx_passphrase) {
        modifiableSecurity.pfx_passphrase = env[envVariable];
      } else  if (envVariable == env_browser_cert) {
        modifiableSecurity.browser_cert = env[envVariable];
      } else  if (envVariable == env_browser_passphrase) {
        modifiableSecurity.browser_passphrase = env[envVariable];
      }
    } catch (error) {
      console.log(error);
      console.log(
        "Error occured processing environment variables. Ignore and carry on looking for more valid security content."
      );
    }
  }
  return modifiableSecurity;
}

module.exports = getSecurityInfoFromEnv;