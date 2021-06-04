/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext } from "react";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";
import ReactDOM from "react-dom";
import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import UpdateWizard from "./UpdateWizard";
import { Button, Modal } from "carbon-components-react";

export default function UpdateButtonWidget() {
  console.log("UpdateButtonWidget");
  const identificationContext = useContext(IdentificationContext);
  const instancesContext = useContext(InstancesContext);

  const isDisabled = () => {
    return instancesContext.focus.instance === null;
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
      instancesContext.updateRelationshipInstance(payLoad.node);
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
          <Button disabled={isDisabled()} onClick={() => setOpen(true)}>
            Update
          </Button>
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
