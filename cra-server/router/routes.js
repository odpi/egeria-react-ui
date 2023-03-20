/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const https = require("https");
const rateLimit = require("express-rate-limit");

const getAxiosInstance = require("../functions/getAxiosInstance");
const getCertificateFromFileSystem = require("../functions/getCertificateFromFileSystem");

const validateURL = require("../validations/validateURL");
const validateAdminURL = require("../validations/validateAdminURL");

/**
 * This module contains the middleware to handle the inbound requests. There is code to handle the login and code to route
 * inbound rest calls to up to the appropraite service (admin or view service) running on the connected omag server.
 * 
 */



// required for codeQL to ensure that logins are rate limitted
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});


// EgeriaRootCA.p12 is a bundle which contains the root certiication authority certificate,
// this is used as the truststore and keystore. 
const rootCABundle = fs.readFileSync(
  path.join(__dirname, "../../") + "ssl/EgeriaRootCA.p12"
);

passphrase = "egeria";

/**
 * Middleware to handle post requests that start with /login i.e. the login request. The tenant segment has been removed by previous middleware.
 * The login is performed using passport' local authentication (http://www.passportjs.org/docs/authenticate/).
 * TODO support other authentication style e.g oauth and ldap both of which passport supports.
 */
router.post("/login", loginLimiter, function (req, res, next) {
  console.debug("/login");
  // get passport instance from app
  const passport = req.app.get("passport");
  passport.authenticate("local", function (err, user, next) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({ status: "failed", error: "Invalid credentials" });
    }

    // req / res held in closure
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }

      delete user.password; // <- super secure :)

      return res.json({ status: "success", user });
    });
  })(req, res, next);
});

/**
 * logout - destroy the session
 */
router.get("/logout", function (req, res) {
  console.debug("/logout");
  req.session.destroy(function (err) {
    // https://stackoverflow.com/questions/13758207/why-is-passportjs-in-node-not-removing-session-on-logout
    //  explicity clear the cookie.
    res.clearCookie("connect.sid");
    res.sendStatus(200);
  });
});

router.get("/user", (req, res) => {
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log('/user');
  // console.log(req.user);
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

const staticJoinedPath = path.join(
  __dirname,
  "../../cra-client/build/index.html"
);
router.use(express.static(staticJoinedPath, { index: false }));
const joinedPath = path.join(
  __dirname,
  "../../cra-client/build/",
  "index.html"
);

// populate the ssl information for the view server from the environment
// getSSLInfoForViewServerFromEnv();
/**
 * Process login url,
 */
router.get("/login", loginLimiter, (req, res) => {
  // Disabling logging as CodeQL does not like user supplied values being logged.
  console.log("/login called " + joinedPath);
  res.sendFile(joinedPath);
});

router.post("/servers/*", (req, res) => {
  const incomingUrl = req.url;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log("/servers/* post called " + incomingUrl);
  const body = req.body;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  //console.log("Got body:", body);
  const servers = req.app.get("servers");
  if (validateURL(incomingUrl, servers)) {
    const instance = getAxiosInstance(incomingUrl, req.app);
    instance
      .post("", body)
      .then(function (response) {
        console.debug("response.data");
        console.debug(response.data);
        const resBody = response.data;
        res.setHeader("Content-Type", "application/json");
        res.json(resBody);
      })
      .catch(function (error) {
        console.error(error);
        res.status(400).send("Error issuing create");
      });
  } else {
    res.status(400).send("Error, invalid supplied URL: " + incomingUrl);
  }
});

/**
 * Middleware to proxy put requests that start with /servers.
 * The outbound call is made with https.
 */
router.put("/servers/*", (req, res) => {
  const incomingUrl = req.url;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  //console.log("/servers/* put called " + incomingUrl);
  const body = req.body;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  //console.log("Got body:", body);
  const servers = req.app.get("servers");
  if (validateURL(incomingUrl, servers)) {
   
    const instance = getAxiosInstance(incomingUrl, req.app);
    instance
      .put("", body)
      .then(function (response) {
        console.debug("response.data");
        console.debug(response.data);
        const resBody = response.data;
        res.setHeader("Content-Type", "application/json");
        res.json(resBody);
      })
      .catch(function (error) {
        console.error(error);
        res.status(400).send(error);
      });
  } else {
    res.status(400).send("Error, invalid supplied URL: " + incomingUrl);
  }
});

/**
 * Middleware to proxy delete requests that start with /servers.
 * The outbound call is made with https.
 */
router.delete("/servers/*", (req, res) => {
  const incomingUrl = req.url;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log("/servers/* delete called " + incomingUrl);
  const servers = req.app.get("servers");
  if (validateURL(incomingUrl, servers)) {
    const instance = getAxiosInstance(incomingUrl, req.app);
    instance
      .delete()
      .then(function (response) {
        console.debug("response.data");
        console.debug(response.data);
        const resBody = response.data;
        res.setHeader("Content-Type", "application/json");
        res.json(resBody);
      })
      .catch(function (error) {
        console.error(error);
        res.status(400).send(error);
      });
  } else {
    res.status(400).send("Error, invalid supplied URL: " + incomingUrl);
  }
});

/**
 * Middleware to proxy get requests that start with /servers.
 * The outbound call is made with https.
 */
router.get("/servers/*", (req, res) => {
  const url = req.url;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log("/servers/* get called " + url);
  const servers = req.app.get("servers");
  if (validateURL(url, servers)) {
    const instance = getAxiosInstance(url, req.app);
    instance
      .get()
      .then(function (response) {
        const resBody = response.data;
        res.setHeader("Content-Type", "application/json");
        res.json(resBody);
      })
      .catch(function (error) {
        console.error(error);
        res.status(400).send("Error issuing get");
      });
  } else {
    res.status(400).send("Error, invalid supplied URL: " + url);
  }
});

// Handle admin services
router.get("/open-metadata/admin-services/*", (req, res) => {
  const incomingPath = req.path;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log("/open-metadata/admin-services/* get called " + incomingPath);
  if (!validateAdminURL(incomingPath)) {
    res.status(400).send("Error, invalid supplied URL: " + incomingPath);
    return;
  }
  const servers = req.app.get("servers");
  const server = servers[req.query.serverName];
  const urlRoot = server.remoteURL;
  const pfx = getCertificateFromFileSystem(server.pfx);
  const ca = getCertificateFromFileSystem(server.ca);
  const passphrase = server.passphrase;
  const rejectUnauthorized = server.rejectUnauthorizedForOmag;

  const apiReq = {
    method: "get",
    url: urlRoot + incomingPath,
    httpsAgent: new https.Agent({
      ca: rootCABundle,      // certificate authority
    //  pfx: rootCABundle,     // also contains the certifcates to validate against.
      passphrase: passphrase,
      rejectUnauthorized: rejectUnauthorized
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  axios(apiReq)
    .then(function (response) {
      // console.log({response});
      const resBody = response.data;
      // console.log({resBody});
      if (resBody.relatedHTTPCode == 200) {
        res.json(resBody);
      } else {
        throw new Error(resBody.exceptionErrorMessage);
      }
    })
    .catch(function (error) {
      console.error({ error });
      res.status(400).send("Error issuing an admin get");
    });
});

router.post("/open-metadata/admin-services/*", (req, res) => {
  const incomingUrl = req.url;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log("/open-metadata/admin-services/* post called " + incomingUrl);
  if (!validateAdminURL(incomingUrl)) {
    res.status(400).send("Error, invalid supplied URL: " + incomingUrl);
    return;
  }
  const { config, serverName } = req.body;
  const servers = req.app.get("servers");
  const server = servers[req.query.serverName];
  const urlRoot = server.remoteURL;
  const pfx = getCertificateFromFileSystem(server.pfx);
  const ca = getCertificateFromFileSystem(server.ca);
  const passphrase = server.passphrase;
  const rejectUnauthorized = server.rejectUnauthorizedForOmag;



  const apiReq = {
    method: "post",
    url: urlRoot + incomingUrl,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    httpsAgent: new https.Agent({
      ca: ca,
      pfx: pfx,
      passphrase: passphrase,
      rejectUnauthorized: rejectUnauthorized
    }),
  };
  if (config) apiReq.data = config;
  axios(apiReq)
    .then(function (response) {
      const resBody = response.data;
      if (resBody.relatedHTTPCode == 400) {
        // Config parameter error
        throw new Error(resBody.exceptionErrorMessage);
      }
      res.setHeader("Content-Type", "application/json");
      res.json(resBody);
    })
    .catch(function (error) {
      console.error(error);
      res.status(400).send("Error issuing admin post");
    });
});

router.delete("/open-metadata/admin-services/*", (req, res) => {
  const incomingUrl = req.url;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.debug("/open-metadata/admin-services/* delete called " + incomingUrl);
  if (!validateAdminURL(incomingUrl)) {
    res.status(400).send("Error, invalid supplied URL: " + incomingUrl);
    return;
  }
  const { config, serverName } = req.body;
  const servers = req.app.get("servers");
  const server = servers[req.query.serverName];
  const urlRoot = server.remoteURL;
  const pfx = getCertificateFromFileSystem(server.pfx);
  const ca = getCertificateFromFileSystem(server.ca);
  const passphrase = server.passphrase;

  const rejectUnauthorized = server.rejectUnauthorizedForOmag;

  const apiReq = {
    method: "delete",
    url: urlRoot + incomingUrl,
    headers: {
      "Content-Type": "application/json",
    },
    httpsAgent: new https.Agent({
      ca: ca,
      pfx: pfx,
      passphrase: passphrase,
      rejectUnauthorized: rejectUnauthorized
    }),
  };
  if (config) apiReq.data = config;
  axios(apiReq)
    .then(function (response) {
      const resBody = response.data;
      if (resBody.relatedHTTPCode == 400) {
        // Config parameter error
        throw new Error(resBody.exceptionErrorMessage);
      }
      res.setHeader("Content-Type", "application/json");
      res.json(resBody);
    })
    .catch(function (error) {
      console.error(error);
      res.status(400).send(error);
    });
});

// Handle platform services
router.get("/open-metadata/platform-services/*", (req, res) => {
  const incomingPath = req.path;
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log("/open-metadata/platform-services/* get called " + incomingPath);
  // TODO: Add validator for platform url
  // if (!(validatePlatformURL(incomingPath))) {
  //   res.status(400).send("Error, invalid supplied URL: " + incomingPath);
  //   return;
  // }
  console.log("/open-metadata/platform-services req.query " + JSON.stringify(req.query) );
  const servers = req.app.get("servers");
  const server = servers[req.query.serverName];
  const urlRoot = server.remoteURL;
  const pfx = getCertificateFromFileSystem(server.pfx);
  const ca = getCertificateFromFileSystem(server.ca);
  const passphrase = server.passphrase;

  const rejectUnauthorized = server.rejectUnauthorizedForOmag;

  const apiReq = {
    method: "get",
    url: urlRoot + incomingPath,
    httpsAgent: new https.Agent({
      ca: ca,
      pfx: pfx,
      passphrase: passphrase,
      rejectUnauthorized: rejectUnauthorized
    }),
  };
  axios(apiReq)
    .then(function (response) {
      const resBody = response.data;
      if (resBody.relatedHTTPCode == 200) {
        res.json(resBody);
      } else {
        throw new Error(resBody.exceptionErrorMessage);
      }
    })
    .catch(function (error) {
      console.error({ error });
      res.status(400).send("Error issuing platform service call");
    });
});

module.exports = router;
