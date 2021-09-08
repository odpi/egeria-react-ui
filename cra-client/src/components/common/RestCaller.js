/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

function processErrorJson(operationName, json, response) {
  const relatedHTTPCode = json.relatedHTTPCode;
  let msg;
  if (relatedHTTPCode) {
    if (json.exceptionUserAction) {
      msg = json.exceptionUserAction;
    } else if (relatedHTTPCode >= 300 && relatedHTTPCode <= 399) {
      msg = operationName + "Client error.";
    } else if (relatedHTTPCode >= 400 && relatedHTTPCode <= 499) {
      msg = "Server error.";
    } else {
      msg = "Http error code " + relatedHTTPCode + ".";
    }
  } else if (response.errno) {
    if (response.errno === "ECONNREFUSED") {
      msg = "Connection refused to the view server.";
    } else {
      // TODO create nice messages for all the http codes we think are relevant
      msg = "Http errno " + response.errno;
    }
  } else {
    msg = "Unexpected response" + JSON.stringify(response);
  }
  msg =
    operationName +
    " failed. " +
    msg +
    " Contact your administrator to review the server logs.";
  return msg;
}
/**
 * Issue get rest call
 * @param {*} url user to use to issue rest call
 * @param {*} onSuccessful function to call on success
 * @param {*} onError function to call or error
 * @param {*} expectedResult optional expected result - default to 'result'.
 *             The call is successful if there is a good relatedHTTPCode and it contains the expectedResult property
 */
export async function issueRestGet(url, onSuccessful, onError, expectedResult) {
  if (expectedResult === undefined) {
    expectedResult = "result";
  }
  try {
    const response = await fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();
    console.log("issueRestGet complete");
    let msg;

    if (json.relatedHTTPCode === 200 && json[expectedResult]) {
      if (json[expectedResult]) {
        onSuccessful(json);
      } else {
        // got nothing
        msg =
          "Error. Get request succeeded but there were no results. Contact your administrator to review the server logs for errors.";
      }
    } else {
      msg = processErrorJson("Get", json, response);
    }
    if (msg) {
      onError(msg);
    }
  } catch (msg) {
    onError(msg);
  }
}

export async function issueRestCreate(
  url,
  body,
  onSuccessful,
  onError,
  expectedResult
) {
  console.log("issueRestCreate");
  if (expectedResult === undefined) {
    expectedResult = "result";
  }
  try {
    let bodyForRest = {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    };
    if (body) {
      bodyForRest.body = JSON.stringify(body);
    }
    const response = await fetch(url, bodyForRest);
    const json = await response.json();

    let msg;


    if (json.relatedHTTPCode === 200) {
      if (json.class === 'VoidResponse') {
        onSuccessful();
      } else if (json[expectedResult]) {
        onSuccessful(json);
      } else {
        // 200 successful response but we did not get what we expected 
        msg = "Error. Create request succeeded but there were no " + expectedResult  + ". Contact your administrator to review the server logs for errors.";
      }
    } else {
      msg = processErrorJson("Create", json, response);
    }
    if (msg) {
      onError(msg);
    }
  } catch (msg) {
    onError(msg);
  }
}

export async function issueRestDelete(deleteUrl, onSuccessful, onError) {
  try {
    const response = await fetch(deleteUrl, {
      method: "delete",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    await response.json();
    // no response from a delete so no json to return or look for errors in
    onSuccessful();
  } catch (msg) {
    onError(msg);
  }
}

export async function issueRestUpdate(url, body, onSuccessful, onError, 
  expectedResult) {
  if (expectedResult === undefined) {
      expectedResult = "result";
  }
  try {
    const response = await fetch(url, {
      method: "put",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    let msg;
    if (json.relatedHTTPCode === 200) {
      if (json.class === 'VoidResponse') {
        onSuccessful();
      } else if (json[expectedResult]) {
        onSuccessful(json);
      } else {
        // 200 successful response but we did not get what we expected 
        msg = "Error. Update request succeeded but there were no " + expectedResult  + ". Contact your administrator to review the server logs for errors.";
      }
    } else {
      msg = processErrorJson("Update", json, response);
    }
    if (msg) {
      onError(msg);
    }
  } catch (msg) {
    onError(msg);
  }
}
