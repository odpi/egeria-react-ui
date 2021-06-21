/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";

import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import {
  Accordion,
  AccordionItem,
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
import { node } from "prop-types";
import { AgricultureAnalytics16 } from "@carbon/icons-react";

/**
 * This is a Relationship creation wizard is driven from a Term. The first page of the wizard
 * asks the user to choose the type of the relationship to create. The next page then asks the user for the related term
 * that the relationship will connect to.  This is followed by page to define the end1 of the relationship, i.e. which end is which. This
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
  const [endNumber, setEndNumber] = useState(1);
  const [end1Node, setEnd1Node] = useState();
  const [end2Node, setEnd2Node] = useState();

  const [relationshipType, setRelationshipType] = useState();
  const [relationshipTypeDescription, setRelationshipTypeDescription] =
    useState();

  useEffect(() => {
    if (props.currentNode !== undefined && targetNode !== undefined) {
      if (endNumber === 1) {
        setEnd1Node(props.currentNode);
        setEnd2Node(targetNode);
      } else {
        setEnd1Node(targetNode);
        setEnd2Node(props.currentNode);
      }
    }
  }, [endNumber, props.currentNode, targetNode]);
  useEffect(() => {
    if (relationshipType !== undefined) {
      let description = relationshipType.description;
      if (description === undefined) {
        description = "TODO";
      }

      setRelationshipTypeDescription(description);
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
  const handleToggleEnds = () => {
    if (endNumber === 1) {
      setEndNumber(2);
    } else {
      setEndNumber(1);
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
    let chosen = false;
    if (end1Node !== undefined && end2Node !== undefined) {
      chosen = true;
    }
    return chosen;
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
    if (validatePropertiesUserInput(extendedUserInput, true)) {
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
    if (node.systemAttributes.guid === props.currentNode.systemAttributes.guid) {
      alert("Cannot create a relationship to ourself.");
    } else {
      setTargetNode(node);
    }
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
    return (
      "Choose Term to relate to " +
      props.currentNode.name +
      " for '" +
      relationshipType.label +
      "'"
    );
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
  const otherEndNumber = () => {
    let otherEnd = 2;
    if (endNumber === 2) {
      otherEnd = 1;
    }
    return otherEnd;
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
    payLoad.node = targetNode;
    payLoad.relationship = relationship;
    props.onCreated(payLoad);
  };

  const relationshipTypeChosen = () => {
    return relationshipType !== undefined;
  };

  const completeRelationshipToCreate = () => {
    let myRelationshipToCreate;
    if (targetNode !== undefined) {
      myRelationshipToCreate = {
        ...relationshipToCreate,
      };
      myRelationshipToCreate.class = relationshipType.typeName;
      myRelationshipToCreate.relationshipType = relationshipType.typeName;
      myRelationshipToCreate.name = relationshipType.typeName;
      let end1 = {};
      end1.class = "RelationshipEnd";
      end1.nodeType = "Term";
      end1.nodeGuid = end1Node.systemAttributes.guid;
      let end2 = {};
      end2.class = "RelationshipEnd";
      end2.nodeType = "Term";
      end2.nodeGuid = end2Node.systemAttributes.guid;
      myRelationshipToCreate.end1 = end1;
      myRelationshipToCreate.end2 = end2;
    }
    return myRelationshipToCreate;
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
            <h3 className="wizard-page-title">{getStep1Title()}</h3>
            <div>
              <Select
                defaultValue="placeholder-item"
                helperText={relationshipTypeDescription}
                onChange={relationshipTypeSelected}
                id="select-relationship-type"
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
                  <SelectItem text="Preferred term" value="preferredterm" />
                  <SelectItem text="Replacement Term" value="replacementterm" />
                  <SelectItem text="Translation" value="translation" />
                  <SelectItem
                    text="Is a (classifying relationship)"
                    value="isa"
                  />
                  <SelectItem text="ValidValue" value="validvalue" />
                  <SelectItem text="Related Term" value="relatedterm" />
                </SelectItemGroup>
                <SelectItemGroup label="Contexts">
                  <SelectItem text="Used In Context" value="usedincontext" />
                </SelectItemGroup>
                <SelectItemGroup label="Spine Objects">
                  <SelectItem
                    text="Has a (contains relationship)"
                    value="hasa"
                  />
                    {/* there is a deprecated is a type of with the ends defined the wrong way round  */}
                  <SelectItem
                    text="Is a type of (super type relationship)"
                    value="isatypeof"
                  />
                  <SelectItem
                    text="Typed by (attributes typed by relationship)"
                    value="typedby"
                  />
                </SelectItemGroup>
              </Select>
            </div>
          </div>
        )}
        {currentStepIndex === 1 && (
          <div>
            <h3 className="wizard-page-title">{getStep2Title()}</h3>
            <StartingNodeNavigation
              match={props.match}
              nodeTypeName="term"
              onSelectCallback={onTermSelect}
            />
          </div>
        )}
        {currentStepIndex === 2 && (
          <div>
            <h3 className="wizard-page-title">{getStep3Title()}</h3>

            <div className="ends-sentence">
              <div className="bold_text">{end1Node.name}</div>

              {relationshipType.end1.attributeVerbWithAttributeAsSubject}
              <div className="bold_text">{end2Node.name}</div>
            </div>
            <div className="ends-sentence">
              <div className="bold_text">{end2Node.name}</div>
              {relationshipType.end2.attributeVerbWithAttributeAsSubject}
              <div className="bold_text">{end1Node.name}</div>
            </div>

            <div>
              <Button onClick={handleToggleEnds}>Switch ends</Button>
              <Accordion>
                <AccordionItem title="Term details">
                  <div>End 1</div>
                  <table className="relationshipend-table">
                    <tr className="relationshipend-table">
                      <th className="relationshipend-table">Property</th>
                      <th className="relationshipend-table">Value</th>
                    </tr>
                    <tr className="relationshipend-table">
                      <td className="relationshipend-table">Name</td>
                      <td className="relationshipend-table">{end1Node.name}</td>
                    </tr>
                    <tr className="relationshipend-table">
                      <td className="relationshipend-table">Qualified Name</td>
                      <td className="relationshipend-table">
                        {end1Node.qualifiedName}
                      </td>
                    </tr>
                    <tr className="relationshipend-table">
                      <td className="relationshipend-table">Description</td>
                      <td className="relationshipend-table" d>
                        {end1Node.description}
                      </td>
                    </tr>
                  </table>
                  <div>End 2</div>
                  <table className="relationshipend-table">
                    <tr className="relationshipend-table">
                      <th className="relationshipend-table">Property</th>
                      <th className="relationshipend-table">Value</th>
                    </tr>
                    <tr className="relationshipend-table">
                      <td className="relationshipend-table">Name</td>
                      <td className="relationshipend-table">{end2Node.name}</td>
                    </tr>
                    <tr className="relationshipend-table">
                      <td className="relationshipend-table">Qualified Name</td>
                      <td className="relationshipend-table">
                        {end2Node.qualifiedName}
                      </td>
                    </tr>
                    <tr className="relationshipend-table">
                      <td className="relationshipend-table">Description</td>
                      <td className="relationshipend-table">
                        {end2Node.description}
                      </td>
                    </tr>
                  </table>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}
        {currentStepIndex === 3 && (
          <div>
            <h3 className="wizard-page-title">{getStep4Title()}</h3>
            <RelationshipInput
              currentRelationshipType={relationshipType}
              onAttributeChange={onAttributeChange}
              operation="Create"
              inputRelationship={userInput}
            />
          </div>
        )}
        {currentStepIndex === 4 && (
          <div>
            <h3 className="wizard-page-title">{getStep5Title()}</h3>
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
