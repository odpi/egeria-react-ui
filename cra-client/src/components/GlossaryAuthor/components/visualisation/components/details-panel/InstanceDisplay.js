/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";

import { InstancesContext }  from "../../contexts/InstancesContext";

import PropTypes             from "prop-types";

import NodeDisplay         from "./NodeDisplay";

import RelationshipDisplay     from "./RelationshipDisplay";



export default function InstanceDisplay() {

  const instancesContext = useContext(InstancesContext);

  if (instancesContext.getFocusGUID() === "") {

    /* 
     * No instance is selected as the focus - display an 'empty' message
     */
    return <p>Nothing is selected</p>    

  }
  else {

    /* 
     * An instance is selected as the focus - display it
     */
    const focusCategory = instancesContext.getFocusCategory();

    if (focusCategory === "Node") {
      return <NodeDisplay node={instancesContext.getFocusNode()} />
    }
    else if (focusCategory === "Relationship") {
      return <RelationshipDisplay relationship={instancesContext.getFocusRelationship()} />
    }
  }
}

InstanceDisplay.propTypes = {
  children: PropTypes.node 
};
