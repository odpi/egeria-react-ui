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


  const node         = props.node;
  const label        = node.name;
  const description  = node.description;
  const qualifiedName= node.qualifiedName;
  const gen          = node.gen;
  const typeName     = node.nodeType; 
  const systemAttributes = node.systemAttributes;    

  return (
    <div className="instance-details-container">
      <div className="instance-details-item">Name : {label}</div>
      <div className="instance-details-item">Type : {typeName}</div>
      <div className="instance-details-item">Description : {description}</div>
      <div className="instance-details-item">Qualified Name : {qualifiedName}</div>
      <div className="instance-details-item">Type : {typeName}</div>
      <div className="instance-details-item">Version : {systemAttributes.version}</div>
      {/* <div className="instance-details-item">Status : <InstanceStatusDisplay inst={entity} /></div> */}
         {/* TODO Node specific properties */}

      <button className="collapsible-non-bold" id="querySummary" onClick={flipSection}> Generation information : </button>
      <div className="content">
        <div className="instance-details-item">Added in gen : {gen}</div>
      </div>

      <button className="collapsible-non-bold" id="controlProps" onClick={flipSection}>System Attributes: </button>
      <div className="content">
        <ul className="details-sublist">
          <li className="details-sublist-item">Version : {systemAttributes.version}</li>
          <div className="instance-details-item">GUID : {systemAttributes.guid}</div>
          <li className="details-sublist-item">createdBy : {systemAttributes.createdBy}</li>
          <li className="details-sublist-item">createTime : {systemAttributes.createTime}</li>
          <li className="details-sublist-item">updatedBy : {systemAttributes.updatedBy ? systemAttributes.updatedBy : "empty"}</li>
          <li className="details-sublist-item">updateTime : {systemAttributes.updateTime ? systemAttributes.updateTime : "empty"}</li>
          <li className="details-sublist-item">maintainedBy : { !systemAttributes.maintainedBy ? "empty" :
            <ul className="details-sublist">
              {systemAttributes.maintainedBy.sort().map( (mtr) => <li className="details-sublist-item" key={mtr}> {mtr}</li> )}
            </ul>
            }
          </li>
          <li className="details-sublist-item">instanceLicense : {systemAttributes.instanceLicense ? systemAttributes.instanceLicense : "empty"}</li>
          {/* <li className="details-sublist-item">instanceProvenanceType : {entity.instanceProvenanceType ? entity.instanceProvenanceType : "empty"}</li>
          <li className="details-sublist-item">replicatedBy : {entity.replicatedBy ? entity.replicatedBy : "empty"}</li> */}
        </ul>
      </div>
    </div>
  );
}


NodeDisplay.propTypes = {
  node: PropTypes.object
};
  
