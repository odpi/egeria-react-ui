/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
const fs = require("fs");
const getCertificateFromFileSystem = (certificate_fileName) => {
  
  return fs.readFileSync(certificate_fileName);
};

module.exports = getCertificateFromFileSystem;
