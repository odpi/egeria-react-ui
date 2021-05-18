/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState } from "react";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
} from "carbon-components-react";
import NodeInput from "../nodepages/NodeInput";
import NodeReadOnly from "../nodepages/NodeReadOnly";
import { useHistory } from "react-router-dom";
import { parse } from "date-fns";
import {
  hasContent,
  isTimeStringValid,
  validateNodePropertiesUserInput
} from "../../../common/Validators";

/**
 * This is a glossary creation wizard. The first page of the wizard
 * asks the user to input values for the glossary create. The next page then asks the user for the glossary that the
 * glossary will be stored in. This is followed by an optional parant categoty , finally there is a confirmation screen,
 *  where the user can confirm the values that will be used to create the glossary.
 *
 * This component drives the NodeInput component, which displays the node. There are callbacks to the wizard
 * when the user has finsished with entering creation content and chosen a glossary.
 * This component then driven NodeInput which displays the confirmation screen, issue the create and then does the results
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
  // in the case of date time the values is an object contianing the users date and time text
  const [userInput, setUserInput] = useState();

  const [dateTimeFromMessage, setDateTimeFromMessage] = useState("");
  const [dateTimeToMessage, setDateTimeToMessage] = useState("");

  let history = useHistory();
  console.log("CreateNodeWizard");

  const handleGotCreateDetailsOnClick = (e) => {
    e.preventDefault();
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  };

  const confirmCreateDetails = (e) => {
    e.preventDefault();
    if (currentStepIndex === 2) {
      setCurrentStepIndex(3);
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
    let myUserInput = {
      ...userInput,
      [attributeKey]: attributeValue,
    };
    setUserInput(myUserInput);

    // now work out what is valid inthe input and update the node we will use s the rest body if valid
    // let isValid = false;
    // if (
    //   attributeKey === "effectiveFromTime" ||
    //   attributeKey === "effectiveToTime"
    // ) {
    //   let dateTime = undefined;
    //   // TODO change the attribute value from an object containing a date long and
    //   // a time text into a long (number of milliseconds since epoch)
    //   if (attributeValue !== undefined) {
    //     const date = attributeValue.date;
    //     const time = attributeValue.time;
    //     // we need to check for validity before updating the nodeForInput

    //     if (date === undefined) {
    //       if (hasContent(time)) {
    //        /// invalid not allowed a undefined date and a defined time -as this does not make sense
    //       } else {
    //         isValid = true;
    //       }
    //     } else {
    //       if (time !== undefined && time !== "") {
    //         // a date and time have been specified
    //         // parse the time string using the reference date to fill in any other values.
    //         if (isTimeStringValid(time)) {
    //           dateTime = parse(time, "HH:mm", date);
    //           isValid = true;
    //         }
    //       } else {
    //         // date is defined but time is not; this is valid.
    //         // we assume only a valid date can come back.
    //         dateTime = date;
    //         isValid = true;
    //       }
    //     }
    //   }
    //   if (isValid && dateTime !== undefined) {
    //     // set the milliseconds as the attribute value.
    //     attributeValue = dateTime.getTime();
    //   }
    // } else if (attributeKey === "name") {
    //   if (hasContent(attributeValue)) {
    //     isValid = true;
    //   }
    // } else {
    //   // all other attributes have no validation
    //   isValid = true;
    // }
    if (validateNodePropertiesUserInput(myUserInput)) {
      let myNodeToCreate = {
        ...nodeToCreate,
        [attributeKey]: attributeValue,
      };
      setNodeToCreate(myNodeToCreate);
    }
  };
  const validateUserInput = () => {
    return validateNodePropertiesUserInput(userInput);
  }

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
