/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import { IdentificationContext } from "../../contexts/IdentificationContext";

import { Accordion, AccordionItem } from "carbon-components-react";
import getNodeType from "./components/properties/NodeTypes.js";
import { BrowserRouter } from "react-router-dom";
import GlossaryAuthorRoutes from "./components/navigations/GlossaryAuthorRoutes";
import GlossaryAuthorBreadCrumb from "./components/GlossaryAuthorBreadCrumb";

export default function GlossaryAuthor() {
  // const GlossaryAuthor = (match) => {
  const [connected, setConnected] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [exceptionUserAction, setExceptionUserAction] = useState();
  const [responseCategory, setResponseCategory] = useState();
  const [exceptionErrorMessage, setExceptionErrorMessage] = useState();
  const [systemAction, setSystemAction] = useState();
  const [fullResponse, setFullResponse] = useState();
  const [glossaryAuthorURL, setGlossaryAuthorURL] = useState();
  const identificationContext = useContext(IdentificationContext);

  const nodeType = getNodeType(identificationContext.getRestURL("glossary-author"), "glossary");
  // Try to connect to the server. The [] means it only runs on mount (rather than every render)
  useEffect(() => {
    setGlossaryAuthorURL(
      identificationContext.getBrowserURL("glossary-author")
    );
    issueConnect();
  }, []);

  const handleOnAnimationEnd = (e) => {
    document.getElementById("connectionChecker").classList.remove("shaker");
  };
  const issueConnect = () => {
    // it could be that we have lost the connection due to a refresh in that case the we will not have a userid.

    if (nodeType.url.includes("users//")) {
      const serverName = window.location.pathname.split("/")[1];

      const loginUrl =
        window.location.protocol +
        "//" +
        window.location.hostname +
        ":" +
        window.location.port +
        "/" +
        serverName +
        "/login";
      if (window.history.pushState) {
        alert(
          "We have lost the session possibly due to a refresh of the web page. Please re-enter your credentials"
        );
        window.history.pushState({}, null, loginUrl);
        window.history.go();
      } else {
        alert(
          "The Browser does not support history. Please re-login here: " +
            loginUrl
        );
      }
    } else {
      // get one page of glossaries
      const fetchUrl = nodeType.url + "?pageSize=1&searchCriteria=&exactValue=false&mixedCase=true";
      console.log("URL to be submitted is " + fetchUrl);
      setErrorMsg(undefined);
      setExceptionUserAction(undefined);
      setResponseCategory(undefined);
      setExceptionErrorMessage(undefined);
      setSystemAction(undefined);
      setFullResponse(undefined);

      fetch(fetchUrl, {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("get glossaries worked " + JSON.stringify(res));
          if (res.relatedHTTPCode === 200) {
            setConnected(true);
          } else {
            setFullResponse(JSON.stringify(res));
            if (res.responseCategory) {
              setErrorMsg(res.exceptionUserAction);
              setExceptionUserAction(res.exceptionUserAction);
              setResponseCategory(res.responseCategory);
              setExceptionErrorMessage(res.exceptionErrorMessage);
              setSystemAction(res.systemAction);
            } else if (res.errno) {
              if (res.errno === "ECONNREFUSED") {
                setErrorMsg(
                  "Retry the request when the View Server is available"
                );
              } else {
                setErrorMsg("Error occurred");
              }
            } else {
              setErrorMsg("Error occurred");
            }
            document
              .getElementById("connectionChecker")
              .classList.add("shaker");
            setConnected(false);
          }
        })
        .catch((res) => {
          setConnected(false);
          setErrorMsg("Full Response is " + JSON.stringify(res));
        });
    }
  };

  const handleOnClick = (e) => {
    console.log("GlossaryAuthor connectivity handleClick(()");
    e.preventDefault();
    issueConnect();
  };

  return (
    <div>
      {connected && (
        <div>
            <BrowserRouter>
              <GlossaryAuthorBreadCrumb />
              {/* This will cause the view to be changed as a result of the url change */}
              <GlossaryAuthorRoutes glossaryAuthorURL={glossaryAuthorURL} />
            </BrowserRouter>
        </div>
      )}
      {!connected && (
        <div>
          <div>
            Unable to use the UI as we are not Connected to the server - press
            button to retry.
          </div>
          <div className="bx--form-item">
            <button
              id="connectionChecker"
              className="bx--btn bx--btn--secondary"
              onClick={handleOnClick}
              type="button"
              onAnimationEnd={handleOnAnimationEnd}
            >
              Connect
            </button>
          </div>
          <div style={{ color: "red" }}>{errorMsg}</div>
          <Accordion>
            <AccordionItem title="Details">
              <div>{errorMsg}</div>
              {exceptionUserAction && <div>{exceptionUserAction}</div>}
              {responseCategory && (
                <div>Response category: {responseCategory}</div>
              )}
              {exceptionErrorMessage && (
                <div>Exception Error Message: {exceptionErrorMessage}</div>
              )}
              {systemAction && <div>System Action: {systemAction}</div>}
              {fullResponse && <div>Full response: {fullResponse}</div>}
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}