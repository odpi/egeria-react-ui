/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React from "react";
import NodeReadOnly from "../authoringforms/NodeReadOnly";

export default function NodeDisplayDetails(props) {

  /**
   * Display a node
   * @param {*} node
   */

  console.log("NodeDisplayDetails");

  return (
    <div>
      {props.node !== undefined && (
        <div>
          <div className="bottom-margin">
            <div className="bx--form-item">
              <div className="lhs-header">{props.node.nodeType} selected</div>
              <div>
                The version of the {props.node.nodeType} on the server is{" "}
                {props.node.systemAttributes.version}.{" "}
              </div>
              <div>
                The generation on the canvas of the {props.node.nodeType} is{" "}
                {props.node.gen}{" "}
              </div>
            </div>
          </div>
          <div className="bx--form-item">
            <div className="lhs-header">Properties</div>
          </div>
          <NodeReadOnly
              currentNodeType={props.currentNodeType}
              inputNode={props.node}
             />
        </div>
      )}
    
    </div>
  );
}
