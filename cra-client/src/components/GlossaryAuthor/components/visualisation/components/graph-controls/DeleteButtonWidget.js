/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext } from "react";

import { IdentificationContext } from "../../../../../../contexts/IdentificationContext";

import { InstancesContext } from "../../contexts/InstancesContext";

import getNodeType from "../../../properties/NodeTypes.js";

import ReactDOM from "react-dom";

import DeleteWizard from "../../../delete/DeleteWizard";

import { Modal, ProgressStep } from "carbon-components-react";
import { propTypes } from "react-markdown";

export default function DeleteButtonWidget() {
  console.log("DeleteButtonWidget");

  const identificationContext = useContext(IdentificationContext);

  const instancesContext = useContext(InstancesContext);

  const isDisabled = () => {
    let isDisabled = true; 
    const anchorGUID = instancesContext.getAnchorNodeGUID()
    if  (instancesContext.focus.instance !== null && instancesContext.focus.instance.systemAttributes.guid !== anchorGUID) {
      isDisabled = false;
    }
    return isDisabled;
  };

  const onDeleted = (payLoad) => {
    if (payLoad.node !== undefined) {
      const nodeTypeName = payLoad.node.nodeType.toLowerCase();
      const nodeType = getNodeType(
        identificationContext.getRestURL("glossary-author"),
        nodeTypeName
      );
      instancesContext.deleteNodeInstance(payLoad.node, nodeType);
    }
    if (payLoad.relationship !== undefined) {
      instancesContext.deleteRelationshipInstance(
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
            Delete Artifact
          </button>
        )}
      >
        {({ open, setOpen }) => (
          <Modal
            modalHeading="Delete"
            open={open}
            passiveModal={true}
            onRequestClose={() => setOpen(false)}
          >
            <DeleteWizard
              onDeleted={onDeleted}
              onModalContentRequestedClose={() => setOpen(false)}
            />
          </Modal>
        )}
      </ModalStateManager>
    </div>
  );
}
