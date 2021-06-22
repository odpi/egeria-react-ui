/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext } from "react";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";
import ReactDOM from "react-dom";
import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import DeleteWizard from "./DeleteWizard";
import { Button, Modal } from "carbon-components-react";

export default function UpdateButtonWidget() {
  console.log("DeleteButtonWidget");
  const identificationContext = useContext(IdentificationContext);
  const instancesContext = useContext(InstancesContext);
  const isDisabled = () => {
    return instancesContext.focus.instance === null;
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
      instancesContext.deleteRelationshipInstance(payLoad.relationship, payLoad.relationship.relationshipTypeName);
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
          <div className="authoring-button" type="button" disabled={isDisabled()} onClick={() => setOpen(true)} >
            Delete Artifact
          </div>
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
