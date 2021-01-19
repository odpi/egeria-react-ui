/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext }                   from "react";

import { ResourcesContext }                    from "../../contexts/ResourcesContext";



import "./details-panel.scss";


export default function EngineDisplay() {

  const resourcesContext = useContext(ResourcesContext);





  const expandParameters = (parameters) => {

    let parameterList;
    /*
     * Sort the request parameter keys
     */
    let parmetersNamesUnsorted = Object.keys(parameters);
    if (parmetersNamesUnsorted) {
      let parmetersNamesSorted   = parmetersNamesUnsorted.sort();
      parameterList = parmetersNamesSorted.map( (parameter) =>
        <li className="details-sublist-item" key={parameter}> 
          {parameter} : {parameters[parameter]} 
        </li>
      );
    }
    else {
      parameterList = null;
    }
    return parameterList;
  };



  const formatRequestType = (requestTypeName, requestTypeParameters) => {
    return (
      <div>
        <div className="details-sublist-item-bold">Request Type : {requestTypeName ? requestTypeName : <i>blank</i>}</div>
        <ul className="type-details-container">       
          {expandParameters(requestTypeParameters)}
        </ul>
      </div>
    );
  };


  const expandRequestTypes = (requestTypes) => {

    let requestTypeList;

    /*
     * Sort the request type names - the keys of the map are the request types - the values are the parameters
     */
    let requestTypeNamesUnsorted = Object.keys(requestTypes);
    if (requestTypeNamesUnsorted) {
      let requestTypeNamesSorted   = requestTypeNamesUnsorted.sort();

      /*
       * Use the name to index into the map in sorted order and display the service properties
       */
      requestTypeList = requestTypeNamesSorted.map( (reqTypeName) =>
        <li className="details-sublist-item" key={reqTypeName}>
          {formatRequestType(reqTypeName, requestTypes[reqTypeName])}
        </li>
      );
    }
    else {
      requestTypeList = null;
    }
    return requestTypeList;
  };


  const formatService = (service) => {
    let serviceProps = service.serviceProperties;
    let requestTypes = service.requestTypeParameters;
    return (
      <div>
        <div className="type-details-item-bold">Name : {serviceProps.displayName ? serviceProps.displayName : <i>blank</i>}</div>
        <div className="type-details-item-bold">Qualified Name : </div>
        <div className="type-details-item-">{serviceProps.qualifiedName ? serviceProps.qualifiedName : <i>blank</i>}</div>
        <div className="type-details-item-bold">Description : </div>
        <div className="type-details-item">{serviceProps.description ? serviceProps.description : <i>blank</i>}</div>
        <div className="type-details-item-bold">Owner Type : </div>
        <div className="type-details-item">{serviceProps.ownerType ? serviceProps.ownerType : <i>blank</i>}</div>
        <div className="type-details-item-bold">Request Types : </div>
        <ul className="type-details-container">       
          {expandRequestTypes(requestTypes)}
        </ul>
      </div>
    );
  };


  const expandServices = (serviceMap) => {

    let serviceList;

    /*
     * Sort the service names - the keys of the map are the services' qualified names
     */
    let serviceNamesUnsorted = Object.keys(serviceMap);
    if (serviceNamesUnsorted) {
      let serviceNamesSorted   = serviceNamesUnsorted.sort();

      /*
       * Use the name to index into the map in sorted order and display the service properties
       */
      serviceList = serviceNamesSorted.map( (svcName) =>
        <li className="details-sublist-item" key={svcName}>
          {formatService(serviceMap[svcName])}
        </li>
      );
    }
    else {
      serviceList = null;
    }

    return serviceList;
  };



  let focus = resourcesContext.focus;
  let engine;
  if (focus.category === "engine-instance") {
    engine = resourcesContext.getFocusEngine();
    if (!engine) {
      return null;
    }
  }
  else {
    /*
     * The focus is not an engine-instance, so do nothing...
     */
    return null;
  }


  return (

    <div className="type-details-container">
      <div className="type-details-item-bold">Engine Name : {engine.engineDisplayName}</div>

      <div className="type-details-item-bold">QualifiedName : </div>
      <div className="type-details-item">{engine.engineQualifiedName ? engine.engineQualifiedName : <i>blank</i>}</div>
    
      <div className="type-details-item-bold">Description : </div>
      <div className="type-details-item">{engine.engineDescription ? engine.engineDescription : <i>blank</i>}</div>

      <div className="type-details-item-bold">TypeDescription : </div>
      <div className="type-details-item">{engine.engineTypeDescription ? engine.engineTypeDescription : <i>blank</i>}</div>

      <div className="type-details-item-bold">Version : </div>
      <div className="type-details-item">{engine.engineVersion ? engine.engineVersion : <i>blank</i>}</div>

      <div className="type-details-item-bold">GUID : </div>
      <div className="type-details-item">{engine.engineGUID ? engine.engineGUID : <i>blank</i>}</div>

      <div className="type-details-item-bold">UserId : </div>
      <div className="type-details-item">{engine.engineUserId ? engine.engineUserId : <i>blank</i>}</div>

      <div className="type-details-item-bold">Registered Services : </div>
      <ul className="type-details-container">       
        {expandServices(engine.serviceMap)}          
      </ul>
       
    </div>
  );

}


EngineDisplay.propTypes = {
  
};

