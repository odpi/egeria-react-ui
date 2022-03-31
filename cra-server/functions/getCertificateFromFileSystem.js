/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const path = require("path")
const fs = require("fs");
const getCertificateFromFileSystem = (certificate_fileName) => {
  
  return fs.readFileSync(path.join(__dirname, "../../ssl/") + certificate_fileName);
};

module.exports = getCertificateFromFileSystem;
