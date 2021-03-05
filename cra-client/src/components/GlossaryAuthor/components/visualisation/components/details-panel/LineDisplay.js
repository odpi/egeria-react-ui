/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React from "react";

import PropTypes from "prop-types";

import InstanceStatusDisplay from "./InstanceStatusDisplay";

import InstancePropertiesDisplay from "./InstancePropertiesDisplay";

import "./details-panel.scss";

export default function LineDisplay(props) {
  /*
   * Handler for flopping a collapsible
   */
  const flipSection = (evt) => {
    /*
     * Use currentTarget (not target) - because we need to operate relative to the button,
     * which is where the handler is defined, in order for the content section to be the sibling.
     */
    const element = evt.currentTarget;
    element.classList.toggle("active");
    const content = element.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  };

  const expLine = props.expLine;

  const line = expLine.line;
  const lineDigest = expLine.lineDigest;
  const label = lineDigest.label;
  const gen = lineDigest.gen;

  return (
    <div className="instance-details-container">
      <div className="instance-details-item">Line : {label}</div>
      <div className="instance-details-item">
        Type : {line.type.typeDefName}
      </div>
      <div className="instance-details-item">Version : {line.version}</div>
      <div className="instance-details-item">
        Status : <InstanceStatusDisplay inst={line} />
      </div>
      <div className="instance-details-item">
        Properties :{" "}
        {!line.properties ? (
          "empty"
        ) : (
          <InstancePropertiesDisplay properties={line.properties} />
        )}
      </div>
      <div className="instance-details-item">GUID : {line.guid}</div>
      <div className="instance-details-item">
        Line Ends :
        {/* <div className="details-sub-container">
          Line end 1 : <LineEndDisplay lineEnd={line.lineEnd1} />
        </div>
        <div className="details-sub-container">
          Line end 2 : <LineEndDisplay lineEnd={line.lineEnd2} />
        </div> */}
      </div>

      <button
        className="collapsible-non-bold"
        id="querySummary"
        onClick={flipSection}
      >
        {" "}
        Glossary Author Visualisation Retrieval :{" "}
      </button>
      <div className="content">
        <div className="instance-details-item">Added in gen : {gen}</div>
      </div>

      <button
        className="collapsible-non-bold"
        id="controlProps"
        onClick={flipSection}
      >
        {" "}
        OMRS Control Properties :{" "}
      </button>
      <div className="content">
        <ul className="details-sublist">
          <li className="details-sublist-item">createdBy : {line.createdBy}</li>
          <li className="details-sublist-item">
            createTime : {line.createTime}
          </li>
          <li className="details-sublist-item">
            updatedBy : {line.updatedBy ? line.updatedBy : "empty"}
          </li>
          <li className="details-sublist-item">
            updateTime : {line.updateTime ? line.updateTime : "empty"}
          </li>
          <li className="details-sublist-item">
            maintainedBy{" "}
            {!line.maintainedBy ? (
              "empty"
            ) : (
              <ul className="details-sublist">
                {line.maintainedBy.sort().map((mtr) => (
                  <li className="details-sublist-item" key={mtr}>
                    {" "}
                    {mtr}
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className="details-sublist-item">
            instanceLicense :{" "}
            {line.instanceLicense ? line.instanceLicense : "empty"}
          </li>
        </ul>
      </div>
    </div>
  );
}

LineDisplay.propTypes = {
  expLine: PropTypes.object,
};
