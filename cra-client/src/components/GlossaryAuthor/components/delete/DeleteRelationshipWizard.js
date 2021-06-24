/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import {
  Button,
} from "carbon-components-react";
import RelationshipReadOnly from "../authoringforms/RelationshipReadOnly";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getRelationshipType from "../properties/RelationshipTypes.js";
import { useHistory } from "react-router-dom";

/**
 * This is a relationship delete properties wizard. There is a confirmation screen,
 * where the user can confirm the values that will be used to delete the relationship.
 *
 * This component then drives RelationshipReadOnly, which displays the confirmation screen, issues the delete and then shows the results
 * of the delete.
 *
 * @param {*} props
 * @returns
 */
export default function DeleteRelationshipWizard(props) {
  const identificationContext = useContext(IdentificationContext);
  const [relationshipDeleted, setRelationshipDeleted] = useState();
  // this will be used for the rest body
  const [relationshipToDelete, setRelationshipToDelete] = useState();
  
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

  
  const getCurrentRelationshipType = ()=> {
    const key = props.currentRelationship.relationshipType.toLowerCase();
    return getRelationshipType(identificationContext.getRestURL("glossary-author"), key);
  }

  const getTitle = () => {
    return "Delete " + props.currentRelationship.relationshipType + " Wizard";
  };
  const getStep1Title = () => {
    return "Supply " + props.currentRelationship.relationshipType + " properties";
  };
  const getStep1Label = () => {
    return "Delete";
  };
  const getStep1Description = () => {
    return "Step 1: Delete a " + props.currentRelationship.relationshipType;
  };

  const getStep2Title = () => {
    let title = "Pressing Delete will delete the " +props.currentRelationship.relationshipType + " and lose the current diagram.";
    if (relationshipDeleted !== undefined) {
      title = props.currentRelationship.relationshipType  + " Deleted";
    }
    return title;
  };
  const getStep2Label = () => {
    return "Confirm";
  };
  const getStep2Description = () => {
    return "Step 2: confirm the " +props.currentRelationshiptypeName + " details, then delete.";
  };

  const onDelete = (relationship) => {
    console.log("OnDelete");
    setRelationshipDeleted(relationship);
    let payLoad = {};
    payLoad.relationship = relationship;
    props.onDeleted(payLoad);
  };

  return (
    <div>
      <h1>{getTitle()}</h1>
      <div className="wizard-navigation-container">

        {relationshipDeleted !== undefined && (
          <div>
            <Button kind="secondary" onClick={finished}>
              Finished
            </Button>
          </div>
        )}
      </div>
      <div className="wizard-navigation-container">
    

          <div>
            <h3 className="wizard-page-title">{getStep2Title()}</h3>
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
