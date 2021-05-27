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
import { parse } from "date-fns";

/**
 * This is a glossary creation wizard. The first page of the wizard
 * asks the user to input values for the glossary create. Finally there is a confirmation screen,
 *  where the user can confirm the values that will be used to create the glossary.
 *
 * This component drives the NodeInput component, which displays the node. There are callbacks to the wizard
 * when the user has finsished with entering creation content.
 * This component then drives NodeReadOnly which displays the confirmation screen, issues the create and then shows the results
 * of the create.
 *
 * @param {*} props
 * @returns
 */
export default function CreateGlossaryWizard(props) {
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
  console.log("CreateGlossaryWizard");

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

  const getTitle = () => {
    return "Create " + props.currentNodeType.typeName + " Wizard";
  };
  const getStep1Title = () => {
    return "Supply Glossary properties";
  };
  const getStep1Label = () => {
    return "Create";
  };
  const getStep1Description = () => {
    return "Step 1: Create a Glossary";
  };

  const getStep2Title = () => {
    let title = "Creating a new Glossary with these details.";
    if (nodeCreated !== undefined) {
      title = "Glossary Created";
    }
    return title;
  };
  const getStep2Label = () => {
    return "Confirm";
  };
  const getStep2Description = () => {
    return "Step 2: confirm the Glossary details, then create.";
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
          label={getStep2Label()}
          description={getStep2Description()}
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

        {currentStepIndex === 1 && nodeCreated === undefined && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
          </div>
        )}
        {currentStepIndex === 1 && nodeCreated !== undefined && (
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
