/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const axios = require('axios');
const https = require("https");
const getCertificateFromFileSystem = require("../functions/getCertificateFromFileSystem");

const getAxiosInstance = (url, app) => {

  try {

    const urlArray = url.split("/");

    const suppliedServerName = urlArray[2];
    const remainingURL = urlArray.slice(3).join("/");
    const servers = app.get('servers');
    const urlRoot = servers[suppliedServerName].remoteURL;
    const remoteServerName = servers[suppliedServerName].remoteServerName;
    const server = servers[suppliedServerName]

    const pfx = getCertificateFromFileSystem(server.pfx);
    const ca = getCertificateFromFileSystem(server.ca);
    const passphrase = server.passphrase;
    

    const rejectUnauthorized = server.rejectUnauthorizedForOmag;
    const downStreamURL =
      urlRoot +
      "/servers/" +
      remoteServerName +
      "/open-metadata/view-services/" +
      remainingURL;
    const instance = axios.create({
      baseURL: downStreamURL,
      httpsAgent: new https.Agent({
        ca: ca,
        pfx: pfx,
        passphrase: passphrase,
        rejectUnauthorized: rejectUnauthorized
      }),
    });
    return instance;

  } catch (err) {
    
    console.log(err);
    throw err;

  }

};

module.exports = getAxiosInstance;