/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext } from "react";
import { IdentificationContext } from "../contexts/IdentificationContext";
import Egeriacolor from "../images/odpi/Egeria_logo_color_400";
export default function Home() {
  const identificationContext = useContext(IdentificationContext);
  console.log("Home identificationContext", identificationContext);
  return (
    <div>
      <h1> Welcome to Egeria React UI</h1>
      <div>Click a task on the left to get started</div>
      <div class="flip-box center">
        <div class="flip-box-inner">
          <div class="flip-box-front">
            <Egeriacolor />
          </div>
          <div class="flip-box-back">
            <div class="center-400-container">
              <div class="center-400-content">
                <p>
                  A persona based user interface to work with Egeria solutions
                  and ecosytems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
