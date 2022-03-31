/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const setConfigurationFromEnv = (app) => {
  let servers = {};
  let platforms = {};
  // capitals as Windows can be case sensitive.
  const env_server_prefix = "EGERIA_PRESENTATIONSERVER_SERVER_";
  const env_platform_prefix = "EGERIA_PRESENTATIONSERVER_REMOTE_PLATFORM_";

  let supplied_pfx_file_name;
  let supplied_ca_file_name;
  let supplied_passphrase;
  const env = process.env;

  for (const envVariable in env) {
    try {
      if (envVariable.startsWith(env_server_prefix)) {
        // Found an environment variable with out prefix
        if (envVariable.length == env_server_prefix.length - 1) {
          console.log(
            "there is no server name specified in the environment Variable envVariable.length=" +
              envVariable.length +
              ",env_server_prefix.length - 1=" +
              env_server_prefix.length -
              1
          );
        } else {
          const serverName = envVariable.substr(env_server_prefix.length);
          // console.log("Found server name " + serverName);
          const serverDetailsStr = env[envVariable];
          const serverDetails = JSON.parse(serverDetailsStr);
          if (
            serverDetails.remoteURL != undefined &&
            serverDetails.platform != undefined
          ) {
            console.log(
              "Found server environment variable for server " +
                serverName +
                ", but the remoteURL and platform were specified, this is ambiguous, please specify only one of these values:" +
                serverDetailsStr
            );
          } else if (
            (serverDetails.remoteURL != undefined ||
              serverDetails.platform != undefined) &&
            serverDetails.remoteServerName != undefined
          ) {
            servers[serverName] = serverDetails;
          } else {
            console.log(
              "Found server environment variable for server " +
                serverName +
                ", but neither remoteURL or platform was specified , so we do not know which platform to talk to :" +
                serverDetailsStr
            );
          }
        }
      } else if (envVariable.startsWith(env_platform_prefix)) {
        // Found an environment variable with out prefix
        if (envVariable.length !== env_platform_prefix.length - 1) {
          const platformName = envVariable.substr(env_platform_prefix.length);
          const platformDetailsStr = env[envVariable];
          const platformDetails = JSON.parse(platformDetailsStr);
          if (platformDetails.remoteURL != undefined) {
            console.log(
              "Found a platform  " +
                platformName +
                ", but the remoteURL was not specified, so we do not know where to send requests to" +
                platformDetailsStr
            );
          } else {
            platforms[platformName] = platformDetails;
          }
        }
      } else if (
        envVariable === "EGERIA_CERTIFICATE_FILE_LOCATION_FOR_REACT_UI_SERVER"
      ) {
        supplied_pfx_file_name = env[envVariable];
      } else if (
        envVariable ===
        "EGERIA_CERTIFICATE_FILE_LOCATION_FOR_CERTIFICATE_AUTHORITY"
      ) {
        supplied_ca_file_name = env[envVariable];
      } else if (envVariable === "EGERIA_SECURITY_PASSPHRASE") {
        supplied_passphrase = env[envVariable];
      }
    } catch (error) {
      console.log(error);
      console.log(
        "Error occured processing environment variables. Ignore and carry on looking for more valid server content."
      );
    }
  }
  // at this stage we have some validated content in servers and platforms variables based on the environment varibale content.
  // We now want to reconcile this content so we have a server object that contains the remote url, optional platform name ca, pfx and passphrase.

  let serversWithSecurity = {};

  // used to identify us (the Egeria React UI server)
  let pfx = supplied_pfx_file_name
    ? supplied_pfx_file_name
    : "EgeriaReactUIServer.p12";

  // this is the certificate authority

  let ca = supplied_ca_file_name ? supplied_ca_file_name : "EgeriaRootCA.p12";

  // this is the default password
  let passphrase = supplied_passphrase ? supplied_passphrase : "egeria";

  for (const [serverName, serverInfo] of Object.entries(servers)) {
    console.log(`${serverName}: ${serverInfo}`);
    let serverWithSecurity = {};
    serverWithSecurity.serverName = serverName;
    serverWithSecurity.remoteServerName = serverInfo.remoteServerName;

    if (serverInfo.remoteURL !== undefined) {
      serverWithSecurity.remoteURL = serverInfo.remoteURL;
      serverWithSecurity.ca = ca;
      serverWithSecurity.pfx = pfx;
      serverWithSecurity.passphrase = passphrase;
    } else {
      // must have a platform
      const platformInfo = platforms[serverInfo.platformName];
      serverWithSecurity.remoteURL = platformInfo.remoteURL;
      serverWithSecurity.platfromName = serverInfo.platformName;
      if (platformInfo.ca) {
        serverWithSecurity.ca = platformInfo.ca;
      } else {
        serverWithSecurity.ca = ca;
      }
      if (platformInfo.pfx) {
        serverWithSecurity.pfx = platformInfo.pfx;
      } else {
        serverWithSecurity.pfx = pfx;
      }
      if (platformInfo.passphrase) {
        serverWithSecurity.passphrase = platformInfo.passphrase;
      } else {
        serverWithSecurity.passphrase = passphrase;
      }
    }

    serversWithSecurity[serverName] = serverWithSecurity;
  }
  app.set("servers", serversWithSecurity);
};

module.exports = setConfigurationFromEnv;
