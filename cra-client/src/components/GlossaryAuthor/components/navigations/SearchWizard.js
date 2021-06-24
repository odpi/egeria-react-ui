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
import SearchNodeWizard from "./SearchNodeWizard";

import getNodeType from "../properties/NodeTypes.js";

/**
 * This is a Relationship creation wizard is driven from a Term. The first page of the wizard
 * asks the user to choose the type of the relationship to chosen. The next page then asks the user for the related term
 * that the relationship will connect to.  This is followed by page to define the end1 of the relationship, i.e. which end is which. This
 * is followed by a page in which relationship proeerties can bespecified. Finally there is a confirmation screen,
 *  where the user can confirm the values that will be used to chosen the Relationship.
 *
 * This component then drives RelationshipReadOnly which displays the confirmation screen, issue the chosen and then shows the results
 * of the chosen.
 *
 * @param {*} props
 * @returns
 */
export default function SearchWizard(props) {
  const identificationContext = useContext(IdentificationContext);
  const [nodeType, setNodeType] = useState();
  const [nodeTypeDescription, setNodeTypeDescription] = useState();
  const [chosenButtonDisabled, setChosenButtonDisabled] = useState(true);
  const [showActualWizard, setShowActualWizard] = useState(false);

  useEffect(() => {
    let disabledState = true;
    if (nodeType !== undefined) {
      disabledState = false;
    }
    setChosenButtonDisabled(disabledState);
  }, [nodeType]);

  const nodeTypeSelected = (e) => {
    const selection = e.target.value;
    let myNodeType;
    if (selection !== undefined) {
      myNodeType = getNodeType(
        identificationContext.getRestURL("glossary-author"),
        selection
      );
      setNodeType(myNodeType);
    }
  };
  const onClickChosen = () => {
    setShowActualWizard(true);
  };

  return (
    <div>
      {showActualWizard === false && (
        <div>
          <Button onClick={onClickChosen} disabled={chosenButtonDisabled}>
            Search
          </Button>
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
              <SelectItem text="Activity" value="activity" disabled />
            </SelectItemGroup>
            <SelectItemGroup label="Categories">
              <SelectItem text="Category" value="category" />
              <SelectItem
                text="Subject Area"
                value="subjectareadefintiion"
                disabled
              />
            </SelectItemGroup>
            <SelectItemGroup label="Glossaries">
              <SelectItem text="Glossary" value="glossary" />
              <SelectItem text="Taxonomy" value="taxonomy" disabled />
              <SelectItem
                text="Canonical Glossary"
                value="canonicalglossary"
                disabled
              />
              <SelectItem
                text="Canonical Glossary and Taxonomy"
                value="canonicaltaxonomy"
                disabled
              />
            </SelectItemGroup>
          </Select>
        </div>
      )}
      {showActualWizard === true && (
        <div>
          {nodeType !== undefined &&
            (nodeType.key === "glossary" ||
              nodeType.key === "term" ||
              nodeType.key === "category") && (
              <SearchNodeWizard
                nodeType={nodeType}
                onModalContentRequestedClose={
                  props.onModalContentRequestedClose
                }
                onChosen={props.onChosen}
              />
            )}
        </div>
      )}
    </div>
  );
}
