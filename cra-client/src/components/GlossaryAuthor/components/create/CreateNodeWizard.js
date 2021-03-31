/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState} from "react";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
} from "carbon-components-react";
import StartingNodeNavigation from "../navigations/StartingNodeNavigation";
import CreateNodePage from "./CreateNodePage";
export default function CreateNodeWizard(props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [glossaryGuid, setGlossaryGuid] = useState();
  const [nodeCreated, setNodeCreated] = useState();
  const [nodeToCreate, setNodeToCreate] = useState();
  console.log("CreateNodeWizard");

  const handleGotCreateDetailsOnClick = (e) => {
    e.preventDefault();
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  };
  const reEnterCreateDetails = (e) => {
    e.preventDefault();
    if (currentStepIndex === 1) {
      setCurrentStepIndex(0);
    }
  };
  const confirmCreateDetails = (e) => {
    e.preventDefault();
    if (currentStepIndex === 1) {
      setCurrentStepIndex(2);
    }
  };

  // const handleChoseGlossaryOnClick = (e) => {
  //   e.preventDefault();
  //   if (currentStepIndex === 0) {
  //     setCurrentStepIndex(1);
  //   }
  // };
  // const handleReChooseGlossaryOnClick = (e) => {
  //   e.preventDefault();
  //   if (currentStepIndex === 1) {
  //     setCurrentStepIndex(0);
  //   }
  // };
  const validateGlossaryForm = () => {
    let isValid = false;
    if (glossaryGuid) {
      isValid = true;
    }
    return isValid;
  };
  const isValidForConfirm = () => {
    let isValid = false;
    if (glossaryGuid !== undefined && nodeToCreate !== undefined && nodeToCreate.name !== undefined && nodeToCreate.name !== ""  ) {
      isValid =true;
    }
    return isValid;
  }
  const validateCreateDetails = () => {
    let isValid = false;
    if (nodeToCreate !== undefined && nodeToCreate.name !== undefined && nodeToCreate.name !== "") {
      isValid = true;
    }
    return isValid;
  };


  const onGlossarySelect = (guid) => {
    setGlossaryGuid(guid);
  };
  const onCreate = () => {
    setNodeCreated(true);
  };
  const onGotCreateDetails = (node) => {
    console.log("onGotCreateDetails " + JSON.stringify(node)); 
    if (node.name !== undefined && node.name !== "") {
      setNodeToCreate(node);
    }
  };
  const getTitle = () => {
    return "Create " + props.currentNodeType.typeName + " Wizard";
  };
  const step1Title = () => {
    return "Create";
  };
  const getStep1Label = () => {
    return "Create " + props.currentNodeType.typeName;
  };
  const getStep1Description = () => {
    return "Step1:  Create a " + props.currentNodeType.typeName;
  };
  const step2Title = () => {
    return "Set Glossary";
  };
  const getStep2Description = () => {
    return (
      "Step 2: A glossary needs to be chosen, to store the " +
      props.currentNodeType.key
    );
  };
  const step3Title = () => {
    return "Confirm create";
  };
  const getStep3Description = () => {
    return (
      "Step 3: confirm the " +
      props.currentNodeType.key +
      " details, prior to create"
    );
  };

  return (
    <div>
      <h1>{getTitle()}</h1> 
      <ProgressIndicator currentIndex={currentStepIndex}>
        <ProgressStep
          label={getStep1Label()}
          description={getStep1Description()}
        />
        <ProgressStep
          disabled={!validateCreateDetails()}
          label="Set Glossary"
          description={getStep2Description()}
        />
        <ProgressStep
          disabled={!isValidForConfirm()}
          label="Confirm"
          description={getStep3Description()}
        />
      </ProgressIndicator>
      {currentStepIndex === 0 && (
          <Button
            kind="secondary"
            onClick={handleGotCreateDetailsOnClick}
            disabled={!validateCreateDetails()}
          >
            Next
          </Button>
        )}
        {currentStepIndex === 0 && !nodeCreated && (
          <h3 className="create-wizard-page-title">{step1Title()}</h3>
        )}
        {currentStepIndex === 0 && (
          <div>
            <CreateNodePage
              currentNodeType={props.currentNodeType}
              parentCategoryGuid={props.parentCategoryGuid}
              onGotCreateDetails={onGotCreateDetails}
            />
          </div>
        )}
        {currentStepIndex === 1 && !nodeCreated && (
          <div>
            <Button kind="secondary" onClick={reEnterCreateDetails}>
              Previous
            </Button>
            <Button kind="secondary" onClick={confirmCreateDetails}  disabled={!isValidForConfirm()}>
              Next
            </Button>
            <h3 className="create-wizard-page-title">{step2Title()}</h3>
          </div>
        )}
        {currentStepIndex === 1 && (
          <StartingNodeNavigation
            match={props.match}
            nodeTypeName="glossary"
            onSelectCallback={onGlossarySelect}
          />
        )}
        {currentStepIndex === 2 && (
          <div>
            <CreateNodePage
              currentNodeType={props.currentNodeType}
              glossaryGuid={glossaryGuid}
              parentCategoryGuid={props.parentCategoryGuid}
              onCreateCallback={onCreate}
              nodeToCreate={nodeToCreate}
            />
          </div>
        )}
      </div>
  );
}