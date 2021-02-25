/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

/**
 * This middleware method takes off the first segment which is the serverName an puts it into a query parameter
 * I did consider using Regex match and replace along these lines 'const matchCriteria = /^\/([A-Za-z_][A-Za-z_0-9]+)\//;'
 * but decided not to in case the characters I was tolerating was not enough. Note the split slice join is not not very performant
 * due to the creation of array elements.
 *
 * For urls that start with servers - these are rest calls that need to be passed through to the back end.
 * URLs before and after
 *   /   => /
 *   /servers/aaa => /servers/aaa
 *   /servers/aaa/bbb => /servers/aaa/bbb
 *   /coco1/ => /?servername=coco1
 *   /coco1/abc => /abc?servername=coco1
 *   /coco1/abc/de => /abc/de?servername=coco1
 *   /display.ico => /display.ico
 *
 * This middleware also validates that the server name that has been supplied is valid (i.e. is defined in our list of servers).
 * So we can have a better user experience, the login screen is displayed for /<server name> and /<server name>/login even if the <server name>
 * is invalid. The request will fail on the login post if the <server name> is not known.      
 */
const serverNameMiddleWare = (req, res, next) => {
  // Disabling logging as CodeQL does not like user supplied values being logged.
  // console.log("before " + req.url);
  const segmentArray = req.url.split("/");
  // the supplied url always starts with a '/' so there will always be at least 2 segments
  // '/' goes to "" and ""
  // "/ddd" goes to "" and "ddd"
  const segmentNumber = segmentArray.length;
  let noServerfound = false;
  const servers = req.app.get("servers");

  if (segmentNumber > 1) {
    // the supplied url always starts with a /
    const segment1 = segmentArray.slice(1, 2).join("/");
    // Disabling logging as CodeQL does not like user supplied values being logged.
    // console.log("A segment1 " + segment1);
    const lastSegment = segmentArray.slice(-1);
    const lastSegmentStr = lastSegment[0];
    // Disabling logging as CodeQL does not like user supplied values being logged.
    // console.log("Last segment is " + lastSegmentStr);

    if (
      segment1 != "servers" &&
      segment1 != "open-metadata" &&
      segment1 != "user" &&
       // we want the login screen to be displayed with the get - so we can properly handle the invalid server name - so don't check the server in this case   
      !(segmentNumber == 2 && req.method === 'GET')
    ) {
      // in a production scenario we are looking at login, favicon.ico and bundle.js for for now look for those in the last segment
      // TODO once we have development webpack, maybe the client should send a /js/ or a /static/ segment after the servername so we know to keep the subsequent segments.
      // console.log("req.method "+ req.method); 
      if (lastSegmentStr.startsWith("login") && req.method === 'POST') {
        // segment1 should be the serverName - so validate that it is

        if (servers[segment1] === undefined) {
          //Not in the array of servers
          noServerfound = true;
        }
      }
      if (lastSegmentStr == "bundle.js" || lastSegmentStr == "favicon.ico") {
        req.url = "/" + lastSegment;
      } else {
        // we want the login screen to be displayed with the get - so we can properly handle the invalid server name - so don't check the server in this case  
        if (servers[segment1] === undefined && !((lastSegmentStr.startsWith("login") && req.method === 'GET'))) {
          //Not in the array of servers
          noServerfound = true;
        } else {
          // remove the server name and pass through
          req.url = "/" + segmentArray.slice(2).join("/");
          // we have a valid server name 
          req.query.serverName = segment1;
        } 
      }
    }
  }

  if (noServerfound) {
    // Disabling logging as CodeQL does not like user supplied values being logged.
    // Invalid tenant - this is forbidden
    res.status(403).send("Error, forbidden URL. Please supply a valid Server Name in the URL.");
  } else {
    // Disabling logging as CodeQL does not like user supplied values being logged.
    // console.log("after " + req.url);
    next();
  }
};

module.exports = serverNameMiddleWare;
