/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
} from "carbon-components-react";
import RelationshipInput from "../authoringforms/RelationshipInput";
import RelationshipReadOnly from "../authoringforms/RelationshipReadOnly";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getRelationshipType from "../properties/RelationshipTypes.js";
import { useHistory } from "react-router-dom";
import {
  validatePropertiesUserInput,
  extendUserInput,
} from "../../../common/Validators";
import { parse, format } from "date-fns";

/**
 * This is a relationship update properties wizard. The first page of the wizard
 * asks the user to input property values for the relationship to update. Finally there is a confirmation screen,
 * where the user can confirm the values that will be used to update the relationship.
 *
 * This component drives the RelationshipInput component, which displays the relationship . There are callbacks to the wizard
 * when the user has finished entering update content.
 * This component then drives RelationshipReadOnly, which displays the confirmation screen, issues the update and then shows the results
 * of the update.
 *
 * @param {*} props
 * @returns
 */
export default function UpdateRelationshipPropertiesWizard(props) {
  const identificationContext = useContext(IdentificationContext);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [relationshipUpdated, setRelationshipUpdated] = useState();
  // this will be used for the rest body
  const [relationshipToUpdate, setRelationshipToUpdate] = useState();
  // this will be used to populate the relationship in the 1st page of the wizard. It can contain invalid values.
  // in the case of date time the values is an object containing the users date and time text
  const [userInput, setUserInput] = useState();
  useEffect(() => {
    updateUserInputFromRelationship(props.currentRelationship);
  }, [props.currentRelationship]);
  /**
   * There is new relationship content (from an update response or we are initialising with content). The relationship is the serialised for of a glossary author artifact, used on rest calls.
   * The userInput state variable stores data in a format that the user interface needs, including a value and invalid flag
   * for each attrribute value.
   * This function maps the relationship content to the userInput.
   * @param {*} relationship
   */
  const updateUserInputFromRelationship = (relationship) => {
    const currentRelationshipType = getCurrentRelationshipType();
    let newUserInput = {};
    if (
      currentRelationshipType &&
      currentRelationshipType.attributes &&
      currentRelationshipType.attributes.length > 0
    ) {
      for (let i = 0; i < currentRelationshipType.attributes.length; i++) {
        const attributeName = currentRelationshipType.attributes[i].key;
        newUserInput[attributeName] = {};
        newUserInput[attributeName].value = relationship[attributeName];
        newUserInput[attributeName].invalid = false;
      }
    }

    // change the dates from longs to an object with a date and time
    if (relationship.effectiveFromTime) {
      let dateTimeObject = {};
      dateTimeObject.date = {};
      dateTimeObject.date.value = new Date(relationship.effectiveFromTime);
      dateTimeObject.date.invalid = false;
      dateTimeObject.time = {};
      dateTimeObject.time.value = format(relationship.effectiveFromTime, "HH:mm");
      dateTimeObject.time.invalid = false;
      newUserInput.effectiveFromTime = dateTimeObject;
    }
    if (relationship.effectiveToTime) {
      let dateTimeObject = {};
      dateTimeObject.date = {};
      dateTimeObject.date.value = new Date(relationship.effectiveToTime);
      dateTimeObject.date.invalid = false;
      dateTimeObject.time = {};
      dateTimeObject.time.value = format(relationship.effectiveToTime, "HH:mm");
      dateTimeObject.time.invalid = false;
      newUserInput.effectiveToTime = dateTimeObject;
    }
    setUserInput(newUserInput);
  };
  
  useEffect(() => {
    setRelationshipToUpdate(props.currentRelationship);
  }, [props.currentRelationship]);

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
      payLoad.relationship = relationshipUpdated;
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
      let myRelationshipToUpdate = {
        ...relationshipToUpdate,
        [attributeKey]: attributeValue,
      };
      setRelationshipToUpdate(myRelationshipToUpdate);
    }
  };
  const getCurrentRelationshipType = ()=> {
    const key = props.currentRelationship.relationshipType.toLowerCase();
    return getRelationshipType(identificationContext.getRestURL("glossary-author"), key);
  }
  const validateUserInput = () => {
    return validatePropertiesUserInput(userInput);
  };

  const getTitle = () => {
    return "Update " + props.currentRelationship.relationshipType + " Wizard";
  };
  const getStep1Title = () => {
    return "Supply " + props.currentRelationship.relationshipType + " properties";
  };
  const getStep1Label = () => {
    return "Update";
  };
  const getStep1Description = () => {
    return "Step 1: Update a " + props.currentRelationship.relationshipType;
  };

  const getStep2Title = () => {
    let title = "Updating a " + props.currentRelationship.relationshipType + " with these details.";
    if (relationshipUpdated !== undefined) {
      title = props.currentRelationship.relationshipType  + " Updated";
    }
    return title;
  };
  const getStep2Label = () => {
    return "Confirm";
  };
  const getStep2Description = () => {
    return "Step 2: confirm the " +props.currentRelationshiptypeName + " details, then update.";
  };

  const onUpdate = (relationship) => {
    console.log("OnUpdate");
    setRelationshipUpdated(relationship);
    let payLoad = {};
    payLoad.relationship = relationship;
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

        {currentStepIndex === 1 && relationshipUpdated === undefined && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
          </div>
        )}
        {currentStepIndex === 1 && relationshipUpdated !== undefined && (
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
            <RelationshipInput
              currentRelationshipType={getCurrentRelationshipType()}
              onAttributeChange={onAttributeChange}
              operation="Update"
              inputRelationship={userInput}
            />
          </div>
        )}

        {currentStepIndex === 1 && (
          <div>
            <h3 className="wizard-page-title">{getStep2Title()}</h3>
            <RelationshipReadOnly
              currentRelationshipType={getCurrentRelationshipType()}
              inputRelationship={relationshipToUpdate}
              operation="Update"
              onComplete={onUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
