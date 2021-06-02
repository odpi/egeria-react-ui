/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState,  useContext } from "react";
import ReactDOM from "react-dom";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import getNodeType from "../properties/NodeTypes.js";
import {
  Button,
  Modal 
} from "carbon-components-react";
// import Info16 from "@carbon/icons-react/lib/information/16";


import CreateRelationshipWizard from "./CreateRelationshipWizard";

export default function CreateRelationship() {
  const identificationContext = useContext(IdentificationContext);
  const instancesContext      = useContext(InstancesContext);

  // const onReadyToCreate = () => {
  //   setPrimaryButtonDisabled(false);
  // };

  const getCurrentNode = () => {
    let currentNode;
    const focusNode = instancesContext.getFocusNode();
    if (focusNode && focusNode.nodeType === 'Term') {
      currentNode = focusNode;
    }  
    return currentNode;
  };
  const getCurrentNodeType = () => {
    let currentNodeType;
    const focusNode = instancesContext.getFocusNode();
    if (focusNode && focusNode.nodeType === 'Term') {
      currentNodeType = getNodeType(identificationContext.getRestURL("glossary-author"), focusNode.nodeType);
    }  
    return currentNodeType;
  };
  
  const onRelationshipCreated = (payLoad) => {
    instancesContext.addRelationshipInstance( payLoad.node, payLoad.relationship);
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
      {/* {getCurrentNode() !== undefined && ( */}
        <ModalStateManager
          renderLauncher={({ setOpen }) => (
            <Button onClick={() => setOpen(true)}>Create Relationship</Button>
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
       {/* )}  */}
       </div>
  );
}
