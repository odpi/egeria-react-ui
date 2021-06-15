/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React from "react";
import RelationshipReadOnly from "../authoringforms/RelationshipReadOnly";

export default function RelationshipDisplayDetails(props) {

  /**
   * Display a relationship
   * @param {*} relationship
   */

  console.log("RelationshipDisplayDetails");

  return (
    <div>
      {props.relationship !== undefined && (
        <div>
          <div className="bottom-margin">
            <div className="bx--form-item">
              <div className="lhs-header">{props.relationship.relationshipType} selected</div>
              <div>
                The version of the {props.relationship.relationshipType} on the server is{" "}
                {props.relationship.systemAttributes.version}.{" "}
              </div>
              <div>
                The generation on the canvas of the {props.relationship.relationshipType} is{" "}
                {props.relationship.gen}{" "}
              </div>
            </div>
          </div>
          <div className="bx--form-item">
            <div className="lhs-header">Properties</div>
          </div>
          <RelationshipReadOnly
              currentRelationshipType={props.currentRelationshipType}
              inputRelationship={props.relationship}
             />
        </div>
      )}
    
    </div>
  );
}
