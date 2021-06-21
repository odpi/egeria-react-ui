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
 * This is a relationship delete properties wizard. The first page of the wizard
 * asks the user to input property values for the relationship to delete. Finally there is a confirmation screen,
 * where the user can confirm the values that will be used to delete the relationship.
 *
 * This component drives the RelationshipInput component, which displays the relationship . There are callbacks to the wizard
 * when the user has finished entering delete content.
 * This component then drives RelationshipReadOnly, which displays the confirmation screen, issues the delete and then shows the results
 * of the delete.
 *
 * @param {*} props
 * @returns
 */
export default function DeleteRelationshipPropertiesWizard(props) {
  const identificationContext = useContext(IdentificationContext);
  const [relationshipDeleted, setRelationshipDeleted] = useState();
  // this will be used for the rest body
  const [relationshipToDelete, setRelationshipToDelete] = useState();
  // this will be used to populate the relationship in the 1st page of the wizard. It can contain invalid values.
  // in the case of date time the values is an object containing the users date and time text
  // const [userInput, setUserInput] = useState();
  // useEffect(() => {
  //   deleteUserInputFromRelationship(props.currentRelationship);
  // }, [props.currentRelationship]);
 
  useEffect(() => {
    setRelationshipToDelete(props.currentRelationship);
  }, [props.currentRelationship]);

  let history = useHistory();
  console.log("DeleteWizard");

  const finished = () => {
    if (props.onModalContentRequestedClose) {
      // if in a modal then callback to close the modal
      props.onModalContentRequestedClose();
      let payLoad = {};
      payLoad.relationship = relationshipDeleted;
      props.onDeleted(payLoad);
    } else {
      // in not in a modal got back to the last page 
      history.goBack();
    }
  };

  const onAttributeChange = (attributeKey, attributeValue) => {
    const extendedUserInput = extendUserInput(
      userInput,
      attributeKey,
      attributeValue,
      true   // isRelationship
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
        // we need to delete a single date
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
      let myRelationshipToDelete = {
        ...relationshipToDelete,
        [attributeKey]: attributeValue,
      };
      setRelationshipToDelete(myRelationshipToDelete);
    }
  };
  const getCurrentRelationshipType = ()=> {
    const key = props.currentRelationship.relationshipType.toLowerCase();
    return getRelationshipType(identificationContext.getRestURL("glossary-author"), key);
  }
  const getTitle = () => {
    return "Delete " + props.currentRelationship.relationshipType + " Wizard";
  };

  const getStep1Label = () => {
    return "Delete";
  };



  const onDelete = (relationship) => {
    console.log("OnDelete");
    setRelationshipDeleted(relationship);
    let payLoad = {};
    payLoad.relationship = relationship;
  };

  return (
    <div>
      <h1>{getTitle()}</h1>
      <div className="wizard-navigation-container">
          <div>
            <h3 className="wizard-page-title">{getStep1Title()}</h3>
            <RelationshipReadOnly
              currentRelationshipType={getCurrentRelationshipType()}
              inputRelationship={relationshipToDelete}
              operation="Delete"
              onComplete={onDelete}
            />
          </div>
      </div>
    </div>
  );
}
