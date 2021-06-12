/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext } from "react";
import ReactDOM from "react-dom";
import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import SearchWizard from "./SearchWizard";
import { Button, Modal } from "carbon-components-react";
// import Info16 from "@carbon/icons-react/lib/information/16";

export default function SearchNodeButtonWidget() {
  console.log("searchNodeButtonWidget");
  const instancesContext = useContext(InstancesContext);

  const onNodeChosen = (payLoad) => {
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
          <Button onClick={() => setOpen(true)}>Show a Node</Button>
        )}
      >
        {({ open, setOpen }) => (
          <Modal
            modalHeading="Add Node to canvas"
            open={open}
            passiveModal={true}
            onRequestClose={() => setOpen(false)}
          >
            <SearchWizard
              onChosen={onNodeChosen}
              onModalContentRequestedClose={() => setOpen(false)}
            />
          </Modal>
        )}
      </ModalStateManager>
    </div>
  );
}
