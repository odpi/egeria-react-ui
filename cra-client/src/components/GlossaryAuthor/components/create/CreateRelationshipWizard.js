/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";

import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
  Select,
  SelectItem,
  SelectItemGroup,
} from "carbon-components-react";
import RelationshipInput from "../authoringforms/RelationshipInput";
import RelationshipReadOnly from "../authoringforms/RelationshipReadOnly";
import {
  validatePropertiesUserInput,
  extendUserInput,
} from "../../../common/Validators";
import StartingNodeNavigation from "../navigations/StartingNodeNavigation";
import getRelationshipType from "../properties/RelationshipTypes";

import { parse } from "date-fns";

/**
 * This is a Relationship creation wizard is driven from a Term. The first page of the wizard
 * asks the user to choose the type of the relationship to create. The next page then asks the user for the related term
 * that the relationship will connect to.  This is followed by page to define the ends of the relationship, i.e. which end is which. This
 * is followed by a page in which relationship proeerties can bespecified. Finally there is a confirmation screen,
 *  where the user can confirm the values that will be used to create the Relationship.
 *
 * This component drives the RelationshipInput component, which displays an input screen for the relationship properties. There are callbacks to the wizard
 * when the user has finished with entering creation properties.
 * This component then drives RelationshipReadOnly which displays the confirmation screen, issue the create and then shows the results
 * of the create.
 *
 * @param {*} props
 * @returns
 */
export default function CreateRelationshipWizard(props) {
  const identificationContext = useContext(IdentificationContext);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [relationshipCreated, setRelationshipCreated] = useState();
  // this will be used for the rest body
  const [relationshipToCreate, setRelationshipToCreate] = useState();
  // this will be used to populate the relationship in the properties page of the wizard. It can contain invalid values.
  // in the case of date time the values is an object containing the users date and time text
  const [userInput, setUserInput] = useState();
  // target node (other end) for the relationship
  const [targetNode, setTargetNode] = useState();

  const [relationshipType, setRelationshipType] = useState();
  const [relationshipTypeDescription, setRelationshipTypeDescription] =
    useState();

  // useEffect(() => {
  //   if (userInput === undefined) {
  //     // force validation of name field on initial load of page.
  //     const extendedUserInput = extendUserInput(userInput, "name", undefined);

  //     let newUserInput = {
  //       ...extendedUserInput,
  //     };
  //     setUserInput(newUserInput);
  //   }
  // }, []);
  useEffect(() => {
    if (relationshipType === "synonym") {
      setRelationshipTypeDescription(
        "Link between glossary terms that have the same meaning"
      );
    } else if (relationshipType === "antonym") {
      setRelationshipTypeDescription(
        "Link between glossary terms that have the opposite meaning"
      );
    } else if (relationshipType !== undefined) {
      setRelationshipTypeDescription("TODO");
    } else {
      setRelationshipTypeDescription("");
    }
  }, [relationshipType]);

  console.log("CreateRelationshipWizard");

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
    props.onModalContentRequestedClose();
  };

  const hasTarget = () => {
    return targetNode !== undefined;
  };
  const endsChosen = () => {
    return true;
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
      let myRelationshipToCreate = {
        ...relationshipToCreate,
        [attributeKey]: attributeValue,
      };
      setRelationshipToCreate(myRelationshipToCreate);
    }
  };
  const validateUserInput = () => {
    return true;
    // return validatePropertiesUserInput(userInput);
  };
  const onTermSelect = (node) => {
    setTargetNode(node);
  };
  const relationshipTypeSelected = (e) => {
    const selection = e.target.value;
    if (selection !== undefined) {
      const myRelationshipType = getRelationshipType(
        identificationContext.getRestURL("glossary-author"),
        selection
      );
      setRelationshipType(myRelationshipType);

    }
  };

  const getTitle = () => {
    return "Create Relationship Wizard";
  };
  const getStep1Title = () => {
    return "Choose relationship type";
  };
  const getStep1Label = () => {
    return "Type";
  };
  const getStep1Description = () => {
    return "Step 1: choose relationship type";
  };
  const getStep2Title = () => {
    return "Choose related Term.";
  };
  const getStep2Label = () => {
    return "Choose target";
  };
  const getStep2Description = () => {
    return "Step 2: Choose the Term for the other end of the relationship.";
  };
  const getStep3Title = () => {
    return "Set the relationship ends.";
  };
  const getStep3Label = () => {
    return "Set ends";
  };
  const getStep3Description = () => {
    return "Step 3: Set the relationship ends.";
  };

  const getStep4Title = () => {
    return "Set the relationship properties.";
  };
  const getStep4Label = () => {
    return "Set Properties";
  };
  const getStep4Description = () => {
    return "Step 4: Set the relationship properties.";
  };
  const getStep5Title = () => {
    let title = "Creating a new Relationship with these details.";
    if (relationshipCreated !== undefined) {
      title = "Relationship Created";
    }
    return title;
  };
  const getStep5Label = () => {
    return "Confirm";
  };
  const getStep5Description = () => {
    return "Step 5: Confirm the Relationship details, then create.";
  };

  const onCreate = (relationship) => {
    console.log("OnCreate");
    setRelationshipCreated(relationship);
    let payLoad = {};
    payLoad.node= targetNode;
    payLoad.relationship = relationship;
    props.onCreated(payLoad);
  };

  const relationshipTypeChosen = () => {
    return relationshipType !== undefined;
  };

  const completeRelationshipToCreate = () => {
    let myRelationshipToCreate;
    if (targetNode !== undefined) {
      myRelationshipToCreate =  {
              ...relationshipToCreate
      };
      myRelationshipToCreate.class = "Synonym";
      myRelationshipToCreate.relationshipType = "Synonym";
      myRelationshipToCreate.name = "Synonym";
      let end1 = {};
      end1.class = "RelationshipEnd";
      end1.nodeType = "Term";
      end1.name = "synonyms";
      end1.nodeGuid = props.currentNode.systemAttributes.guid;
      let end2 = {};
      end2.class = "RelationshipEnd";
      end2.nodeType = "Term";
      end2.name = "synonyms";
      end2.nodeGuid = targetNode.systemAttributes.guid;
      myRelationshipToCreate.end1 = end1;
      myRelationshipToCreate.end2 = end2;
    }
    return myRelationshipToCreate;
  }

  return (
    <div>
      <h1>{getTitle()}</h1>
      <ProgressIndicator currentIndex={currentStepIndex}>
        <ProgressStep
          label={getStep1Label()}
          description={getStep1Description()}
        />
        <ProgressStep
          disabled={!relationshipTypeChosen()}
          label={getStep2Label()}
          description={getStep2Description()}
        />
        <ProgressStep
          disabled={!hasTarget}
          label={getStep3Label()}
          description={getStep3Description()}
        />
        <ProgressStep
          disabled={!endsChosen()}
          label={getStep4Label()}
          description={getStep4Description()}
        />
        <ProgressStep
          disabled={!validateUserInput()}
          label={getStep5Label()}
          description={getStep5Description()}
        />
      </ProgressIndicator>
      <div className="wizard-navigation-container">
        {currentStepIndex === 0 && (
          <div>
            <Button
              kind="secondary"
              onClick={handleGotCreateDetailsOnClick}
              disabled={!relationshipTypeChosen()}
            >
              Next
            </Button>
          </div>
        )}
        {currentStepIndex === 1 && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
            <Button kind="secondary" onClick={nextStep} disabled={!hasTarget()}>
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
              disabled={!endsChosen()}
            >
              Next
            </Button>
          </div>
        )}
        {currentStepIndex === 3 && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
            <Button
              kind="secondary"
              onClick={nextStep}
              disabled={!validateUserInput()}
            >
              Next
            </Button>
          </div>
        )}
        {currentStepIndex === 4 && relationshipCreated === undefined && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
          </div>
        )}
        {currentStepIndex === 4 && relationshipCreated !== undefined && (
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
            <div>
              <Select
                defaultValue="placeholder-item"
                helperText={relationshipTypeDescription}
                onChange={relationshipTypeSelected}
                id="select-1"
                invalidText="A valid value is required"
                labelText="Select"
              >
                <SelectItem
                  text="Choose a Relationship type"
                  value="placeholder-item"
                />
                <SelectItemGroup label="Related Terms">
                  <SelectItem text="Synonym" value="synonym" />
                  <SelectItem text="Antonym" value="antonym" />
                  <SelectItem text="Preferred term" value="preferred-term" />
                  <SelectItem
                    text="Replacement Term"
                    value="replacement-term"
                  />
                  <SelectItem text="Translation" value="translation" />
                  <SelectItem
                    text="Is a (classifying relationship)"
                    value="isa"
                  />
                  <SelectItem text="ValidValue" value="valid-value" />
                  <SelectItem text="Related Term" value="related-term" />
                </SelectItemGroup>
                <SelectItemGroup label="Contexts">
                  <SelectItem text="Used In Context" value="used-in-context" />
                </SelectItemGroup>
                <SelectItemGroup label="Spine Objects">
                  <SelectItem
                    text="Has a (contains relationship)"
                    value="has-a"
                  />
                  <SelectItem
                    text="Is a type of (super type relationship)"
                    value="isatypeof"
                  />
                  <SelectItem
                    text="Typed by (attributes typed by relationship)"
                    value="typed-by"
                  />
                </SelectItemGroup>
              </Select>
            </div>
          </div>
        )}
        {currentStepIndex === 1 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep2Title()}</h3>
            <StartingNodeNavigation
              match={props.match}
              nodeTypeName="term"
              onSelectCallback={onTermSelect}
            />
          </div>
        )}
        {currentStepIndex === 2 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep3Title()}</h3>
            {relationshipType === "synonym" && (
              <div>Each Term has the same meaning.</div>
            )}
            {relationshipType === "antonym" && (
              <div>Each Term has the opposite meaning.</div>
            )}
            {relationshipType !== "synonym" &&
              relationshipType !== "antonym" && (
                <div>TODO relationship ends</div>
              )}
          </div>
        )}
        {currentStepIndex === 3 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep4Title()}</h3>
            <RelationshipInput
              currentRelationshipType={props.currentRelationshipType}
              onAttributeChange={onAttributeChange}
              operation="Create"
              inputRelationship={userInput}
            />
          </div>
        )}
        {currentStepIndex === 4 && (
          <div>
            <h3 className="create-wizard-page-title">{getStep5Title()}</h3>
            <RelationshipReadOnly
              currentRelationshipType={relationshipType}
              inputRelationship={completeRelationshipToCreate()}
              operation="Create"
              onComplete={onCreate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
