/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
} from "carbon-components-react";
import NodeInput from "../authoringforms/NodeInput";
import NodeReadOnly from "../authoringforms/NodeReadOnly";
import { useHistory } from "react-router-dom";
import {
  validatePropertiesUserInput,
  extendUserInput,
} from "../../../common/Validators";
import StartingNodeNavigation from "../navigations/StartingNodeNavigation";

import { parse } from "date-fns";

/**
 * This is a Term creation wizard. The first page of the wizard
 * asks the user to input values for the Term create. The next page then asks the user for the glossary that the
 * Term will be stored in. This is followed by an optional parent category, finally there is a confirmation screen,
 *  where the user can confirm the values that will be used to create the Term.
 *
 * This component drives the NodeInput component, which displays the node. There are callbacks to the wizard
 * when the user has finished with entering creation content and chosen a glossary.
 * This component then drives NodeReadOnly, which displays the confirmation screen, issues the create and then shows the results
 * of the create.
 *
 * @param {*} props
 * @returns
 */
export default function CreateTermWizard(props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [nodeCreated, setNodeCreated] = useState();
  // this will be used for the rest body
  const [nodeToCreate, setNodeToCreate] = useState();
  // this will be used to populate the node in the 1st page of the wizard. It can contain invalid values.
  // in the case of date time the values is an object containing the users date and time text
  const [userInput, setUserInput] = useState();

  useEffect(() => {
    if (userInput === undefined) {
      // force validation of name field on initial load of page.
      const extendedUserInput = extendUserInput(userInput, "name", undefined);

      let newUserInput = {
        ...extendedUserInput,
      };
      setUserInput(newUserInput);
    }
  }, []);

  let history = useHistory();
  console.log("CreateTermWizard");

  const handleGotCreateDetailsOnClick = (e) => {
    e.preventDefault();
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  };

  const nextStep = () => {
    const newIndex = currentStepIndex + 1;
    setCurrentStepIndex(newIndex);
  };
  const previousStep = () => {
    const newIndex = currentStepIndex - 1;
    setCurrentStepIndex(newIndex);
  };
  const finished = () => {
    history.goBack();
  };

  const hasGlossary = () => {
    let isValid = false;
    if (
      nodeToCreate !== undefined &&
      nodeToCreate.glossary !== undefined &&
      nodeToCreate.glossary.guid !== undefined
    ) {
      isValid = true;
    }
    return isValid;
  };
  const onAttributeChange = (attributeKey, attributeValue) => {
    const extendedUserInput = extendUserInput(
      userInput,
      attributeKey,
      attributeValue
    );

    let newUserInput = {
      ...extendedUserInput,
    };

    setUserInput(newUserInput);
    if (validatePropertiesUserInput(extendedUserInput)) {
      if (
        attributeKey === "effectiveFromTime" ||
        attributeKey === "effectiveToTime"
      ) {
        // the value is an object with date and time properties
        // we need to create a single date
        if (attributeValue !== undefined) {
          let time = attributeValue.time;
          let date = attributeValue.date;
          if (time === undefined) {
            attributeValue = date;
          } else {
            attributeValue = parse(time, "HH:mm", date);
          }
          attributeValue = attributeValue.getTime();
        }
      }
      let myNodeToCreate = {
        ...nodeToCreate,
        [attributeKey]: attributeValue,
      };
      setNodeToCreate(myNodeToCreate);
    }
  };
  const validateUserInput = () => {
    return validatePropertiesUserInput(userInput);
  };
  const onGlossarySelect = (node) => {
    const guid = node.systemAttributes.guid;
    let glossary = {};
    glossary.guid = guid;
    let myNodeToCreate = {
      ...nodeToCreate,
      ["glossary"]: glossary,
    };
    setNodeToCreate(myNodeToCreate);
  };
  // TODO allow choosing more than one category
  const onParentCategorySelect = (node) => {
    if (node !== undefined) {
      const guid = node.systemAttributes.guid;
      let parentCategory = {};
      parentCategory.guid = guid;
      parentCategory.type = "Category";
      const categories = [parentCategory];
      // create a new object
      let myCreateInput = {
        ...nodeToCreate,
        ["categories"]: categories,
      };
      setNodeToCreate(myCreateInput);
    }
  };

  const getTitle = () => {
    return "Create " + props.currentNodeType.typeName + " Wizard";
  };
  const getStep1Title = () => {
    return "Supply Term properties";
  };
  const getStep1Label = () => {
    return "Create";
  };
  const getStep1Description = () => {
    return "Step 1: Create a Term";
  };
  const getStep2Title = () => {
    return "Choose a glossary to store the Term in.";
  };
  const getStep2Label = () => {
    return "Set Glossary";
  };
  const getStep2Description = () => {
    return "Step 2: A glossary needs to be chosen, to store the Term.";
  };
  const getStep3Title = () => {
    return "Optionally choose a Term categorisation.";
  };
  const getStep3Label = () => {
    return "Set Parent";
  };
  const getStep3Description = () => {
    return "Step 3: A Term can have an associated parent category. ";
  };
  const getStep4Title = () => {
    let title = "Creating a new Term with these details.";
    if (nodeCreated !== undefined) {
      title = "Term Created";
    }
    return title;
  };
  const getStep4Label = () => {
    return "Confirm";
  };
  const getStep4Description = () => {
    return "Step 4: confirm the Term details, then create.";
  };

  const onCreate = (node) => {
    console.log("OnCreate");
    setNodeCreated(node);
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
          disabled={!validateUserInput()}
          label={getStep2Label()}
          description={getStep2Description()}
        />
        <ProgressStep
          disabled={!hasGlossary}
          label={getStep3Label()}
          description={getStep3Description()}
        />
        <ProgressStep
          label={getStep4Label()}
          description={getStep4Description()}
        />
      </ProgressIndicator>
      <div className="wizard-navigation-container">
      {currentStepIndex === 0 && (
          <div>
            <Button
              kind="secondary"
              onClick={handleGotCreateDetailsOnClick}
              disabled={!validateUserInput()}
            >
              Next
            </Button>
          </div>
        )}
        {currentStepIndex === 1 && (
          <div>
            <Button
              kind="secondary"
              onClick={previousStep}
            >
              Previous
            </Button>
            <Button
              kind="secondary"
              onClick={nextStep}
              disabled={!hasGlossary()}
            >
              Next
            </Button>
          </div>
        )}
        {currentStepIndex === 2 && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
            <Button
              kind="secondary"
              onClick={nextStep}
           
            >
              Next
            </Button>
          </div>
        )}
        {currentStepIndex === 3 && nodeCreated === undefined && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
          </div>
        )}
        {currentStepIndex === 3 && nodeCreated !== undefined && (
          <div>
            <Button kind="secondary" onClick={finished}>
              Finished
            </Button>
          </div>
        )}
      </div>
      <div className="wizard-navigation-container">
        {currentStepIndex === 0 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep1Title()}</h3>
            <NodeInput
              currentNodeType={props.currentNodeType}
              onAttributeChange={onAttributeChange}
              operation="Create"
              inputNode={userInput}
            />
          </div>
        )}
        {currentStepIndex === 1 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep2Title()}</h3>
            <StartingNodeNavigation
              match={props.match}
              nodeTypeName="glossary"
              onSelectCallback={onGlossarySelect}
            />
          </div>
        )}
        {currentStepIndex === 2 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep3Title()}</h3>
            <StartingNodeNavigation
              match={props.match}
              nodeTypeName="category"
              onSelectCallback={onParentCategorySelect}
            />
          </div>
        )}
        {currentStepIndex === 3 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep4Title()}</h3>
            <NodeReadOnly
              currentNodeType={props.currentNodeType}
              inputNode={nodeToCreate}
              operation="Create"
              onComplete={onCreate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
