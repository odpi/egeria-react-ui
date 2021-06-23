/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";

import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import DeleteNodeWizard from "./DeleteNodeWizard";
import DeleteRelationshipWizard from "./DeleteRelationshipWizard";

/**
 * This is the deleteWizard, depending on whether the current focus is a node or a relationship,
 * this component dispalys the appropriate wizard.
 * @param {*} props
 * @returns
 */
export default function DeleteWizard(props) {
  const instancesContext = useContext(InstancesContext);

  console.log("DeleteWizard");

  return (
    <div>
      {instancesContext.getFocusNode() && (
        <DeleteNodeWizard
          onDeleted={props.onDeleted}
          onModalContentRequestedClose={props.onModalContentRequestedClose}
          currentNode={instancesContext.getFocusNode()}
        />
      )}
      {instancesContext.getFocusRelationship() && (
        <DeleteRelationshipWizard
          onDeleted={props.onDeleted}
          onModalContentRequestedClose={props.onModalContentRequestedClose}
          currentRelationship={instancesContext.getFocusRelationship()}
        />
      )}
    </div>
  );
}
