/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";

import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import UpdateNodePropertiesWizard from "./UpdateNodePropertiesWizard";
import UpdateRelationshipPropertiesWizard from "./UpdateRelationshipPropertiesWizard";

/**
 * This is the updateWizard, depending on whether the current focus is a node or a relationship,
 * this component dispalys the appropriate wizard.
 * @param {*} props
 * @returns
 */
export default function UpdateWizard(props) {
  const instancesContext = useContext(InstancesContext);

  console.log("UpdateWizard");

  return (
    <div>
      {instancesContext.getFocusNode() && (
        <UpdateNodePropertiesWizard
          onUpdated={props.onUpdated}
          onModalContentRequestedClose={props.onModalContentRequestedClose}
          currentNode={instancesContext.getFocusNode()}
        />
      )}
      {instancesContext.getFocusRelationship() && (
        <UpdateRelationshipPropertiesWizard
          onUpdated={props.onUpdated}
          onModalContentRequestedClose={props.onModalContentRequestedClose}
          currentRelationship={instancesContext.getFocusRelationship()}
        />
      )}
    </div>
  );
}
