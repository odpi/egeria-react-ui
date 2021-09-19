/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React from "react";
import { Button, TextInput } from "carbon-components-react";
import { Add16, Subtract16 } from "@carbon/icons-react";
/**
 * This is a widget that allows the caller to add strings to a list and remove them by pressing buttons labeled with the string values 
 * that have already been added
 * 
 * It is passed the label of the String, a function to call when there is an add, a function to call when there is a remove and the list of current strings.
 * @param {*} props 
 * @returns 
 */
export default function ListOfStrings(props) {
  
  const handleAddString = (e) => {
    const stringValue = document.getElementById("new-string-value").value;
    console.log("handleAddString() called", { stringValue });
    if (stringValue.length === 0) return;
    props.handleAddString(stringValue);
  };

  const handleRemoveString = (index) => {
    console.log("handleRemoveString() called", { index });
    props.handleRemoveStringAtIndex(index);
  };
  return (
    <div className="left-text">
      <div style={{ display: "flex" }}>
        <TextInput
          id="new-string-value"
          name="new-string-value"
          type="text"
          labelText={props.stringLabel}
          inline={true}
          style={{ display: "inline-block" }}
          autoComplete="off"
        />

        <Button
          kind="tertiary"
          size="field"
          renderIcon={Add16}
          iconDescription="Add"
          tooltipAlignment="start"
          tooltipPosition="right"
          onClick={handleAddString}
          style={{ display: "inline-block" }}
        >
          Add
        </Button>
      </div>
      <ul style={{ marginBottom: "32px" }}>
        {props.stringValues.map((stringValue, i) => (
          <li key={`string-value-${i}`} style={{ display: "flex" }}>
            <Button
              hasIconOnly
              kind="tertiary"
              size="small"
              renderIcon={Subtract16}
              id={`string-remove-button-${stringValue}`}
              iconDescription="Remove"
              tooltipAlignment="start"
              tooltipPosition="right"
              onClick={() => handleRemoveString(i)}
            />
             {stringValue}
          </li>
        ))}
      </ul>
    </div>
  );
}
