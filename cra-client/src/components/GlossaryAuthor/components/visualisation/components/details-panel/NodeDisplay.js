/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext} from "react";
import { IdentificationContext } from "../../../../../../contexts/IdentificationContext";
import NodeDisplayDetails from "../../../update/NodeDisplayDetails";
import getNodeType from "../../../properties/NodeTypes";

export default function NodeDisplay(props) {
  const identificationContext = useContext(IdentificationContext);
  const node = props.node;
  const getCurrentNodeType = () => {
    const nodeType = getNodeType(
      identificationContext.getRestURL("glossary-author"),
      node.nodeType.toLowerCase()
    );
    return nodeType;
  };

  return (
    <div>
      <NodeDisplayDetails
        currentNodeType={getCurrentNodeType()}
        node={node}
      />
    </div>
  );
}
