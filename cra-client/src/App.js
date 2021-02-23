/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React from "react";
import "./app.scss";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./auth/login";
import NoServerName from "./auth/NoServerName";
import Frame from "./Frame";
import IdentificationContext from "./contexts/IdentificationContext";

export default function App() {
  return (
    <div>
      <IdentificationContext>
        <Router>
          <Switch>
          <Route path="/" exact>
              <NoServerName/>
            </Route>
            <Route path="/*/login" exact>
              <Login currentURL={window.location.href} />
            </Route>
            <Route path="/*/">
              <Frame />
            </Route>
          </Switch>
        </Router>
      </IdentificationContext>
    </div>
  );
}
