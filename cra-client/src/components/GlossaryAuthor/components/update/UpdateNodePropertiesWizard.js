/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
} from "carbon-components-react";
import NodeInput from "../authoringforms/NodeInput";
import NodeReadOnly from "../authoringforms/NodeReadOnly";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";
import { useHistory } from "react-router-dom";
import {
  validatePropertiesUserInput,
  extendUserInput,
} from "../../../common/Validators";
import { parse, format } from "date-fns";

/**
 * This is a node update properties wizard. The first page of the wizard
 * asks the user to input property values for the node to update. Finally there is a confirmation screen,
 * where the user can confirm the values that will be used to update the node.
 *
 * This component drives the NodeInput component, which displays the node . There are callbacks to the wizard
 * when the user has finished entering update content.
 * This component then drives NodeReadOnly, which displays the confirmation screen, issues the update and then shows the results
 * of the update.
 *
 * @param {*} props
 * @returns
 */
export default function UpdateNodePropertiesWizard(props) {
  const identificationContext = useContext(IdentificationContext);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [nodeUpdated, setNodeUpdated] = useState();
  // this will be used for the rest body
  const [nodeToUpdate, setNodeToUpdate] = useState();
  // this will be used to populate the node in the 1st page of the wizard. It can contain invalid values.
  // in the case of date time the values is an object containing the users date and time text
  const [userInput, setUserInput] = useState();
  useEffect(() => {
    updateUserInputFromNode(props.currentNode);
  }, [props.currentNode]);
  /**
   * There is new node content (from an update response or we are initialising with content). The node is the serialised for of a glossary author artifact, used on rest calls.
   * The userInput state variable stores data in a format that the user interface needs, including a value and invalid flag
   * for each attrribute value.
   * This function maps the node content to the userInput.
   * @param {*} node
   */
  const updateUserInputFromNode = (node) => {
    const currentNodeType = getCurrentNodeType();
    let newUserInput = {};
    if (
      currentNodeType &&
      currentNodeType.attributes &&
      currentNodeType.attributes.length > 0
    ) {
      for (let i = 0; i < currentNodeType.attributes.length; i++) {
        const attributeName = currentNodeType.attributes[i].key;
        newUserInput[attributeName] = {};
        newUserInput[attributeName].value = node[attributeName];
        newUserInput[attributeName].invalid = false;
      }
    }

    // change the dates from longs to an object with a date and time
    if (node.effectiveFromTime) {
      let dateTimeObject = {};
      dateTimeObject.date = {};
      dateTimeObject.date.value = new Date(node.effectiveFromTime);
      dateTimeObject.date.invalid = false;
      dateTimeObject.time = {};
      dateTimeObject.time.value = format(node.effectiveFromTime, "HH:mm");
      dateTimeObject.time.invalid = false;
      newUserInput.effectiveFromTime = dateTimeObject;
    }
    if (node.effectiveToTime) {
      let dateTimeObject = {};
      dateTimeObject.date = {};
      dateTimeObject.date.value = new Date(node.effectiveToTime);
      dateTimeObject.date.invalid = false;
      dateTimeObject.time = {};
      dateTimeObject.time.value = format(node.effectiveToTime, "HH:mm");
      dateTimeObject.time.invalid = false;
      newUserInput.effectiveToTime = dateTimeObject;
    }
    setUserInput(newUserInput);
  };
  
  useEffect(() => {
    setNodeToUpdate(props.currentNode);
  }, [props.currentNode]);

  let history = useHistory();
  console.log("UpdateWizard");

  const handleGotUpdateDetailsOnClick = (e) => {
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
    if (props.onModalContentRequestedClose) {
      // if in a modal then callback to close the modal
      props.onModalContentRequestedClose();
      let payLoad = {};
      payLoad.node = nodeUpdated;
      props.onUpdated(payLoad);
    } else {
      // in not in a modal got back to the last page 
      history.goBack();
    }
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
        // we need to update a single date
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
      let myNodeToUpdate = {
        ...nodeToUpdate,
        [attributeKey]: attributeValue,
      };
      setNodeToUpdate(myNodeToUpdate);
    }
  };
  const getCurrentNodeType = ()=> {
    const key = props.currentNode.nodeType.toLowerCase();
    return getNodeType(identificationContext.getRestURL("glossary-author"), key);
  }
  const validateUserInput = () => {
    return validatePropertiesUserInput(userInput);
  };

  const getTitle = () => {
    return "Update " + props.currentNode.nodeType + " Wizard";
  };
  const getStep1Title = () => {
    return "Supply " + props.currentNode.nodeType + " properties";
  };
  const getStep1Label = () => {
    return "Update";
  };
  const getStep1Description = () => {
    return "Step 1: Update a " + props.currentNode.nodeType;
  };

  const getStep2Title = () => {
    let title = "Updating a " + props.currentNode.nodeType + " with these details.";
    if (nodeUpdated !== undefined) {
      title = props.currentNode.nodeType  + " Updated";
    }
    return title;
  };
  const getStep2Label = () => {
    return "Confirm";
  };
  const getStep2Description = () => {
    return "Step 2: confirm the " +props.currentNodetypeName + " details, then update.";
  };

  const onUpdate = (node) => {
    console.log("OnUpdate");
    setNodeUpdated(node);
    let payLoad = {};
    payLoad.node = node;
    // props.onUpdated(payLoad);
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
              onClick={handleGotUpdateDetailsOnClick}
              disabled={!validateUserInput()}
            >
              Next
            </Button>
          </div>
        )}

        {currentStepIndex === 1 && nodeUpdated === undefined && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
          </div>
        )}
        {currentStepIndex === 1 && nodeUpdated !== undefined && (
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
            <h3 className="wizard-page-title">{getStep1Title()}</h3>
            <NodeInput
              currentNodeType={getCurrentNodeType()}
              onAttributeChange={onAttributeChange}
              operation="Update"
              inputNode={userInput}
            />
          </div>
        )}

        {currentStepIndex === 1 && (
          <div>
            <h3 className="wizard-page-title">{getStep2Title()}</h3>
            <NodeReadOnly
              currentNodeType={getCurrentNodeType()}
              inputNode={nodeToUpdate}
              operation="Update"
              onComplete={onUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
