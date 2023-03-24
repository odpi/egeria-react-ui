/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React     from "react";

import PropTypes from "prop-types";

import "./details-panel.scss";


export default function InstancePropertiesDisplay(props) {

  const instProps           = props.properties;

  let properties;


  const switchValue = (prop) => {
    let value;
    switch (prop.instancePropertyCategory) {
      case "PRIMITIVE" : 
        value = prop.primitiveValue;
        break;
      case "ENUM" :
        value = prop.symbolicName;
        break;
      case "MAP" :
        value = (<ul>  {expandProperties(prop.mapValues)}  </ul>)     
        break;
      case "ARRAY" :
        value = (<ul>  {expandProperties(prop.arrayValues)} </ul>)
        break;
      default:
        alert("Unknown instance property category: "+prop.instancePropertyCategory);
        break;
    }       
    return value;
  };
  
  const expandProperties = (instanceProperties) => {

    let propertyNamesUnsorted = [];
    for (const [key] of Object.entries(instanceProperties)) 
      propertyNamesUnsorted.push(`${key}`);


    let propertyNamesSorted   = propertyNamesUnsorted.sort();
    let propertyList = propertyNamesSorted.map( (propName) => 
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
