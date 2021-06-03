/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";

import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import {
  Button,
  Select,
  SelectItem,
  SelectItemGroup,
} from "carbon-components-react";
import CreateGlossaryWizard from "./CreateGlossaryWizard";
import CreateTermWizard from "./CreateTermWizard";
import CreateCategoryWizard from "./CreateCategoryWizard";

import getNodeType from "../properties/NodeTypes.js";

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
export default function CreateNodeWizard(props) {
  const identificationContext = useContext(IdentificationContext);
  const [nodeType, setNodeType] = useState();
  const [nodeTypeDescription, setNodeTypeDescription] = useState();
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const [showActualWizard, setShowActualWizard] = useState(false);

  useEffect(() => {
    let disabledState = true;
    if (nodeType !== undefined) {
      disabledState = false;
    }
    setCreateButtonDisabled(disabledState);
  }, [nodeType]);

  const nodeTypeSelected = (e) => {
    const selection = e.target.value;
    let myNodeType;
    if (selection !== undefined) {
      myNodeType = getNodeType(
        identificationContext.getRestURL("glossary-author"),
        selection
      );
    }
    setNodeType(myNodeType);
  
  };
  const onClickCreate = () => {
    setShowActualWizard(true);
  }

  return (
    <div>
      {showActualWizard === false && (
        <div>
          <Button onClick={onClickCreate} disabled={createButtonDisabled}>Create</Button>
          <Select
            defaultValue="placeholder-item"
            helperText={nodeTypeDescription}
            onChange={nodeTypeSelected}
            id="select-node-type"
            invalidText="A valid value is required"
            labelText="Select"
          >
            <SelectItem text="Choose a Node type" value="placeholder-item" />
            <SelectItemGroup label="Terms">
              <SelectItem text="Term" value="term" />
              <SelectItem text="Activity" value="activity" />
            </SelectItemGroup>
            <SelectItemGroup label="Categories">
              <SelectItem text="Category" value="category" />
              <SelectItem text="Subject Area" value="subjectareadefintiion" />
            </SelectItemGroup>
            <SelectItemGroup label="Glossaries">
              <SelectItem text="Glossary" value="glossary" />
              <SelectItem text="Taxonomy" value="taxonomy" />
              <SelectItem text="Canonical Glossary" value="canonicalglossary" />
              <SelectItem
                text="Canonical Glossary and Taxonomy"
                value="canonicaltaxonomy"
              />
            </SelectItemGroup>
          </Select>
        </div>
      )}
      {showActualWizard === true && (
      <div>
        {nodeType !== undefined && nodeType.key === "glossary" && (
         <CreateGlossaryWizard
         currentNodeType={nodeType}
         onModalContentRequestedClose={props.onModalContentRequestedClose}
         onCreated={props.onCreated}
         />
        )}

      {nodeType !== undefined && nodeType.key === "term" && (
          <CreateTermWizard
            currentNodeType={nodeType}
            onModalContentRequestedClose={props.onModalContentRequestedClose}
            onCreated={props.onCreated}
            // parentCategoryGuid={parentCategoryGuid}
          />
        )}
        {nodeType !== undefined && nodeType.key === "category" && (
          <CreateCategoryWizard
            currentNodeType={nodeType}
            onModalContentRequestedClose={props.onModalContentRequestedClose}
            onCreated={props.onCreated}
            // parentCategoryGuid={parentCategoryGuid}
          />
        )}
      </div>
      )}
    </div>
  );
}
