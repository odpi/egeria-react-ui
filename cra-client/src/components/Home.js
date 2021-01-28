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
      <div className="flip-box center">
        <div className="flip-box-inner">
          <div className="flip-box-front">
            <Egeriacolor />
          </div>
          <div className="flip-box-back">
            <div className="center-400-container">
              <div className="center-400-content">
                <h2>
                  Community profile home screen coming soon.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
