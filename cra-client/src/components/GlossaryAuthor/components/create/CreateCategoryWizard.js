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


/**
 * This is a node creation wizard - that is used to creae categories and terms. The first page of the wizard 
 * asks the user to input values for the Category or Term to create. The next page then asks the user for the glossary that the 
 * Category or Term will be stored in, finally there is a confirmation screen, where the user can confirm the values 
 * that will be used to create the Node. 
 * 
 * 
 * This component drives the CreateNodePage component, which displays the node. There are callbacks to the wizard 
 * when the user has finsished with entering creation content and chosen a glossary.   
 *   
 * @param {*} props 
 * @returns 
 */
export default function CreateCategoryWizard(props) {
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
  const onRestart = () => {
    setCurrentStepIndex(0);
  };
  const confirmCreateDetails = (e) => {
    e.preventDefault();
    if (currentStepIndex === 1) {
      setCurrentStepIndex(2);
    }
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
    return "Step 1:  Create a " + props.currentNodeType.typeName;
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
            <Button kind="secondary" onClick={onRestart}>
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