/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext } from "react";
import { IdentificationContext } from "../../../../../../contexts/IdentificationContext";
import getNodeType from "../../../properties/NodeTypes.js";
import ReactDOM from "react-dom";
import { InstancesContext } from "../../contexts/InstancesContext";
import UpdateWizard from "../../../update/UpdateWizard";
import { Modal } from "carbon-components-react";

export default function UpdateButtonWidget() {
  console.log("UpdateButtonWidget");
  const identificationContext = useContext(IdentificationContext);
  const instancesContext = useContext(InstancesContext);

  const isDisabled = () => {
    let isDisabled = false;
    if (instancesContext.focus.instance === null) {
      isDisabled = true;
    } else {
      const focusRelationship = instancesContext.getFocusRelationship();
      if (focusRelationship) {
        const focusRelationshipName = focusRelationship.name;
        if (
          focusRelationshipName === "TermAnchor" ||
          focusRelationshipName === "CategoryAnchor"
        ) {
          isDisabled = true;
        }
      }
    }
    return isDisabled;
  };

  const onUpdated = (payLoad) => {
    if (payLoad.node !== undefined) {
      const nodeTypeName = payLoad.node.nodeType.toLowerCase();
      const nodeType = getNodeType(
        identificationContext.getRestURL("glossary-author"),
        nodeTypeName
      );
      instancesContext.updateNodeInstance(payLoad.node, nodeType);
    }
    if (payLoad.relationship !== undefined) {
      const relationshipTypeName =
        payLoad.relationship.relationshipType.toLowerCase();
      instancesContext.updateRelationshipInstance(
        payLoad.relationship,
        payLoad.relationship.relationshipTypeName
      );
    }
  };

  const ModalStateManager = ({
    renderLauncher: LauncherContent,
    children: ModalContent,
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        {!ModalContent || typeof document === "undefined"
          ? null
          : ReactDOM.createPortal(
              <ModalContent open={open} setOpen={setOpen} />,
              document.body
            )}
        {LauncherContent && <LauncherContent open={open} setOpen={setOpen} />}
      </>
    );
  };

  return (
    <div>
      <ModalStateManager
        renderLauncher={({ setOpen }) => (
          <button
            className="authoring-button"
            type="button"
            disabled={isDisabled()}
            onClick={() => setOpen(true)}
          >
            Update Artifact
          </button>
        )}
      >
        {({ open, setOpen }) => (
          <Modal
            modalHeading="Update"
            open={open}
            passiveModal={true}
            onRequestClose={() => setOpen(false)}
          >
            <UpdateWizard
              onUpdated={onUpdated}
              onModalContentRequestedClose={() => setOpen(false)}
            />
          </Modal>
        )}
      </ModalStateManager>
    </div>
  );
}
