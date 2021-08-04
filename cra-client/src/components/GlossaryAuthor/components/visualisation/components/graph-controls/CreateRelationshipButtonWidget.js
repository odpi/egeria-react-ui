/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext } from "react";
import ReactDOM from "react-dom";
import { Modal } from "carbon-components-react";
import { IdentificationContext } from "../../../../../../contexts/IdentificationContext";
import { InstancesContext } from "../../contexts/InstancesContext";
import CreateRelationshipWizard from "../../../create/CreateRelationshipWizard";
import getNodeType from "../../../properties/NodeTypes.js";

export default function CreateRelationshipButtonWidget() {
  const identificationContext = useContext(IdentificationContext);
  const instancesContext = useContext(InstancesContext);
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);

  const getCurrentNode = () => {
    let currentNode;
    const focusNode = instancesContext.getFocusNode();
    let isDisabled = true;
    // TODO allow for other node types.
    if (focusNode && focusNode.nodeType === "Term") {
      currentNode = focusNode;
      isDisabled = false;
    } 
    setCreateButtonDisabled(isDisabled);
    
    return currentNode;
  };
  const getCurrentNodeType = () => {
    let currentNodeType;
    const focusNode = instancesContext.getFocusNode();
    if (focusNode && focusNode.nodeType === "Term") {
      currentNodeType = getNodeType(
        identificationContext.getRestURL("glossary-author"),
        focusNode.nodeType
      );
    }
    return currentNodeType;
  };
  const isDisabled = () => {
    return instancesContext.focus.instance === null;
  };

  const onRelationshipCreated = (payLoad) => {
    instancesContext.addRelationshipInstance(
      payLoad.node,
      payLoad.relationship
    );
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
          <button className="authoring-button" type="button" disabled={isDisabled()} onClick={() => setOpen(true)} >
            Create Relationship
          </button>
        )}
      >
        {({ open, setOpen }) => (
          <Modal
            modalHeading="Create Relationship"
            open={open}
            passiveModal={true}
            onRequestClose={() => setOpen(false)}
          >
            <CreateRelationshipWizard
              currentNodeType={getCurrentNodeType()}
              currentNode={getCurrentNode()}
              onCreated={onRelationshipCreated}
              onModalContentRequestedClose={() => setOpen(false)}
            />
          </Modal>
        )}
      </ModalStateManager>
    </div>
  );
}
