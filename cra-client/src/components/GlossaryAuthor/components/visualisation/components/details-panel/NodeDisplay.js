/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React                          from "react";

import PropTypes                      from "prop-types";

import InstanceStatusDisplay          from "./InstanceStatusDisplay";

import InstancePropertiesDisplay      from "./InstancePropertiesDisplay";

import "./details-panel.scss";


export default function NodeDisplay(props) {


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
    }
    else {
      content.style.display = "block";
    }
  };



  const expNode    = props.expNode;

  // const entity       = expNode.entityDetail;
  // const entityDigest = expNode.entityDigest;

  // const label        = entityDigest.label;
  // const gen          = entityDigest.gen;

  return (
    <div className="instance-details-container">
      {/* <div className="instance-details-item">Node : {label}</div>
      <div className="instance-details-item">Type : {entity.type.typeDefName}</div>
      <div className="instance-details-item">Version : {entity.version}</div>
      <div className="instance-details-item">Status : <InstanceStatusDisplay inst={entity} /></div>
      <div className="instance-details-item">Properties : { !entity.properties ? "empty" :
        <InstancePropertiesDisplay properties={entity.properties} />}</div>
      <button className="collapsible-non-bold" id="querySummary" onClick={flipSection}> Rex Retrieval : </button>
      <div className="content">
        <div className="instance-details-item">Added in gen : {gen}</div>
      </div>


      <button className="collapsible-non-bold" id="controlProps" onClick={flipSection}> System attributes : </button>
      <div className="content">
        <ul className="details-sublist">
          <li className="details-sublist-item">createdBy : {entity.createdBy}</li>
          <li className="details-sublist-item">createTime : {entity.createTime}</li>
          <li className="details-sublist-item">updatedBy : {entity.updatedBy ? entity.updatedBy : "empty"}</li>
          <li className="details-sublist-item">updateTime : {entity.updateTime ? entity.updateTime : "empty"}</li>
          <li className="details-sublist-item">maintainedBy : { !entity.maintainedBy ? "empty" :
            <ul className="details-sublist">
              {entity.maintainedBy.sort().map( (mtr) => <li className="details-sublist-item" key={mtr}> {mtr}</li> )}
            </ul>
            }
          </li>
          <li className="details-sublist-item">instanceLicense : {entity.instanceLicense ? entity.instanceLicense : "empty"}</li>
        </ul> */}
      {/* </div> */}
    </div>
  );
}

NodeDisplay.propTypes = {
  expNode: PropTypes.object
};
  
