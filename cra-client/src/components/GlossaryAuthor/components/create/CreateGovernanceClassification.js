/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import {
  getGovernanceClassification,
  getEnumValuesFromName,
} from "../properties/GovernanceClassifications";
// import enumValues from "../properties/GovernanceClassifications";
import {
  Select,
  SelectItem,
} from "carbon-components-react";
import Info16 from "@carbon/icons-react/lib/information/16";

export default function CreateGovernanceClassification(props) {
  const [governanceClassification, setGovernanceClassification] = useState();
  const [currentAttributes, setCurrentAttributes] = useState();
  const [createBody, setCreateBody] = useState();
  const [
    chosenGovernanceClassification,
    setChosenGovernanceClassification,
  ] = useState();
  const [enabled, setEnabled] = useState(false);
  const [currentEnumValues, setCurrentEnumValues] = useState([]);
  console.log("props " + JSON.stringify(props));

  useEffect(() => {
    const gotGovernanceClassification = getGovernanceClassification(
      props.governanceClassificationName
    );
    setGovernanceClassification(gotGovernanceClassification);
    // need current attributes so we can set the existing values.
    setCurrentAttributes(gotGovernanceClassification.attributes);
  }, [props]);

  console.log("CreateGovernanceClassification");

  const setAttribute = (item, value) => {
    console.log("setAttribute " + item.key + ",value=" + value);
    let myCreateBody = createBody;
    // if (value instanceof Date) {
    //   // send as the number of milliseconds since 1970 rather than as a date object.
    //   value = value.getTime();
    // }
    myCreateBody[item.key] = value;
    // notify the caller when there is a change - so it is up to date with the latest changes
    props.onGovernanceClassificationSet(myCreateBody);
    // update state (this happens asynchronously) so it can be accumulated for the next change 
    setCreateBody(myCreateBody);
  
  };
  const createLabelIdForAttribute = (labelKey) => {
    return (
      "text-input-create" + props.governanceClassificationName + "-" + labelKey
    );
  };
  const createLabelIdForGovernanceClassication = () => {
    return (
      "checkbox-for-create-governance-classificaiton-" +
      props.governanceClassificationName
    );
  };

  const checkboxLabel = (e) => {
    return "Include " + props.governanceClassificationName;
  };
  const onEnabledChange = (e) => {
    if (e.target.checked) {
      setEnabled(true);
      setCreateBody({});
      // define a governance with defaults
      props.onGovernanceClassificationSet({});
    } else {
      setEnabled(false);
      setCreateBody(undefined);
      props.onGovernanceClassificationSet(undefined);
    }
  };
  const onGovernanceClassificationChange = (e) => {
    const selectedIndex = e.target.options.selectedIndex;
    const currentEnumValue = currentEnumValues[selectedIndex];
    if (currentEnumValue !== undefined) {
      setChosenGovernanceClassification(currentEnumValue.description);
      console.log(currentEnumValue.description);
    }
  };
  const onClickFilledInForm = () => {
    if (props.onGovernanceClassificationSet) {
      props.onGovernanceClassificationSet(createBody);
    }
  };
  const getInputByType = (item) => {
    if (item !== undefined && item.type === "enum") {
      const enumObject = getEnumValuesFromName(item.enumValues);
      let enumValuesArray = [];
      for (var prop in enumObject) {
        enumValuesArray.push(prop);
      }
      // setCurrentEnumValues(enumValuesArray);

      return (
        <div>
          <Select
            id="select-1"
            defaultValue="placeholder-item"
            onChange={onGovernanceClassificationChange}
          >
            {enumValuesArray.map((item) => {
              return <SelectItem value={item.index} text={item} />;
            })}
          </Select>
          {/* {chosenGovernanceClassification} */}
        </div>
      );
    } else if (item !== undefined && item.type === "integer") {
      return (
        <input
          id={createLabelIdForAttribute(item.key + "-number")}
          type='number'
          className="bx--text-input"
          value={item.value}
          onChange={(e) => setAttribute(item, e.target.value)}
          placeholder={item.label}
        ></input>
      );
    } else if (item !== undefined && item.type === "date") {
      return (
        <input
          id={createLabelIdForAttribute(item.key + "-date")}
          type='date'
          className="bx--text-input"
          value={item.value}
          onChange={(e) => setAttribute(item, e.target.value)}
          placeholder={item.label}
        ></input>
      );  
    } else {
      return (
        <input
          id={createLabelIdForAttribute(item.key+ "-text")}
          type="text"
          className="bx--text-input"
          value={item.value}
          onChange={(e) => setAttribute(item, e.target.value)}
          placeholder={item.label}
        ></input>
      );
    }
  };

  return (
    <div>
      <label
        htmlFor={createLabelIdForGovernanceClassication()}
        className="bx--label"
      >
        Enable {props.governanceClassificationName} <Info16 />
      </label>
      <input
        type="checkbox"
        id={createLabelIdForGovernanceClassication()}
        onChange={onEnabledChange}
      />
      {governanceClassification !== undefined &&
        enabled === true &&
        currentAttributes !== undefined &&
        currentAttributes.map((item) => {
          return (
            <div className="bx--form-item" key={item.key}>
              <label
                htmlFor={createLabelIdForAttribute(item.key)}
                className="bx--label"
              >
                {item.label} <Info16 />
              </label>
              {getInputByType(item)}
            </div>
          );
        })}
    </div>
  );
}
