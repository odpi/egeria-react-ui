/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext } from "react";
import ReactDOM from "react-dom";
import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import CreateNodeWizard from "./CreateNodeWizard";
import { Button, Modal } from "carbon-components-react";
// import Info16 from "@carbon/icons-react/lib/information/16";

export default function CreateNodeButtonWidget() {
  console.log("CreateNodeButtonWidget");
  const instancesContext = useContext(InstancesContext);

  const onNodeCreated = (payLoad) => {
    instancesContext.addNodeInstance(payLoad.node);
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
          <div className="authoring-button" type="button" onClick={() => setOpen(true)} >
            Create Node
          </div>
        )}
      >
        {({ open, setOpen }) => (
          <Modal
            modalHeading="Create Node"
            open={open}
            passiveModal={true}
            onRequestClose={() => setOpen(false)}
          >
            <CreateNodeWizard
              onCreated={onNodeCreated}
              onModalContentRequestedClose={() => setOpen(false)}
            />
          </Modal>
        )}
      </ModalStateManager>
    </div>
  );
}
