/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React from "react";

import PropTypes from "prop-types";

import "./details-panel.scss";


export default function InstancePropertiesDisplay(props) {

  const instProps = props.properties;

  let properties;


  const switchValue = (prop) => {
    let value;
    switch (prop.instancePropertyCategory) {
      case "PRIMITIVE":
        value = prop.primitiveValue;
        break;
      case "ENUM":
        value = prop.symbolicName;
        break;
      case "MAP":
        if (prop.mapValues !== null && prop.mapValues !== undefined) {
          value = (<ul>  {expandProperties(prop.mapValues.instanceProperties)}  </ul>)
        } else {
          value = "No map values."
        }
        break;
      case "ARRAY":
        if (prop.arrayValues !== null && prop.arrayValues !== undefined) {
          value = (<ul>  {expandProperties(prop.arrayValues.instanceProperties)} </ul>)
        } else {
          value = "No Array values."
        }
        break;
      // it seems like this method can be driven with an unknown prop.instancePropertyCategory. I assume a render occurs before the prop value has been populated
      // removing this alert. 

      // default:
      //   alert("Unknown instance property category: "+prop.instancePropertyCategory);
      //   break;
    }
    return value;
  };

  const expandProperties = (instanceProperties) => {

    let propertyNamesUnsorted = [];
    for (const [key] of Object.entries(instanceProperties))
      propertyNamesUnsorted.push(`${key}`);


    let propertyNamesSorted = propertyNamesUnsorted.sort();
    let propertyList = propertyNamesSorted.map((propName) =>
      <li className="details-sublist-item" key={propName}> {propName} :
        {
          switchValue(instanceProperties[propName])
        }
      </li>

    );

    return propertyList;
  };

  if (instProps === undefined || instProps === null || instProps.instanceProperties === undefined || instProps.instanceProperties === null || instProps.instanceProperties.length === 0) {
    properties = (
      <div>
        list is empty
      </div>
    )
  }
  else {

    properties = (
      <ul className="details-sublist">
        {expandProperties(instProps.instanceProperties)}
      </ul>

    );
  }

  return properties;
}

InstancePropertiesDisplay.propTypes = {
  properties: PropTypes.object
};
