/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext }                   from "react";

import { ResourcesContext }                    from "../../contexts/ResourcesContext";


import "./details-panel.scss";


export default function EngineServiceDisplay() {


  const resourcesContext = useContext(ResourcesContext);


  /*
   * As the user flips a partnerOMAS section, expand the display section and add the partner OMAS
   * to the gens so that it appears in the topology diagram.
   */
  const flipPartnerOMASSection = (evt) => {

    let requestService = false;

    /*
     * Use currentTarget (not target) - because we need to operate relative to the button,
     * which is where the handler is defined, in order for the content section to be the sibling.
     */
    const element = evt.currentTarget;
    element.classList.toggle("active");
    const content = element.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    }
    else {
      content.style.display = "block";
      requestService = true;
    }

    if (requestService) {
      let serviceInstanceGUID = resourcesContext.focus.guid;
    
      /*
       * Ask the resources context to create a floating service instance for the OMAS.
       */
      resourcesContext.loadPartnerOMAS(serviceInstanceGUID, "EngineService");
    }
  };


  /*
   * As the user flips an engine section, expand the engine details display and add the registered
   * engine services.
   */
  const flipEngineSection = (evt) => {

    let requestService = false;

    /*
     * Use currentTarget (not target) - because we need to operate relative to the button,
     * which is where the handler is defined, in order for the content section to be the sibling.
     */
    const element = evt.currentTarget;
    let engineName = element.id;
    element.classList.toggle("active");
    const content = element.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    }
    else {
      content.style.display = "block";
      requestService = true;
    }

    if (requestService) {
      let serviceInstanceGUID = resourcesContext.focus.guid;  // This is the GUID of the OMES

      /*
       * Ask the resources context to create a floating service instance for the OMAS.
       */
      resourcesContext.loadEngine(serviceInstanceGUID, engineName, true);
    }
  };


  /*
   * As the user flips a partnerOMAS section, expand the details display.
   */
  const flipSection = (evt) => {

    /*
     * Use currentTarget (not target) - because we need to operate relative to the button,
     * which is where the handler is defined, in order for the content section to be the sibling.
     */
    const element = evt.currentTarget;
    element.classList.toggle("active");
    const content = element.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    }
    else {
      content.style.display = "block";
    }
  };


  const formatEngine = (engine) => {
    return (
      <div>
        <ul>
          <li className="details-sublist-item">Name : {engine.engineDisplayName ? engine.engineDisplaydName : <i>blank</i>}</li>
          <li className="details-sublist-item">QualifiedName : {engine.engineQualifiedName ? engine.engineQualifiedName : <i>blank</i>}</li>
          <li className="details-sublist-item">Description : {engine.engineDescription ? engine.engineDescription : <i>blank</i>}</li>
          <li className="details-sublist-item">TypeDescription : {engine.engineTypeDescription ? engine.engineTypeDescription : <i>blank</i>}</li>
          <li className="details-sublist-item">Version : {engine.engineVersion ? engine.engineVersion : <i>blank</i>}</li>
          <li className="details-sublist-item">GUID : {engine.engineGUID ? engine.engineGUID : <i>blank</i>}</li>
          <li className="details-sublist-item">UserId : {engine.engineUserId ? engine.engineUserId : <i>blank</i>}</li>
         </ul>
      </div>
    );
  };


  const expandEngines = (inEngines) => {

    let engineList;

    /*
     * Put engines into a map keyed by engine name
     */
    let engineMap = {};
    inEngines.forEach(engine => {
      const engineName = engine.engineQualifiedName;
      engineMap[engineName] = engine;
    });

    /*
     * Sort the engine names
     */
    let engineNamesUnsorted = Object.keys(engineMap);
    if (engineNamesUnsorted) {
      let engineNamesSorted   = engineNamesUnsorted.sort();

      /*
       * Use the name to index into the map in sorted order and display engine
       * id is the GUID (engineId) so that flipEngineSection can use it in the call to loadEngine
       */
      engineList = engineNamesSorted.map( (engName) =>
        <li className="details-sublist-item" key={engName}>
          <button className="collapsible" id={engName} onClick={flipEngineSection}> Engine : {engName} </button>
          <div className="content">
           {formatEngine(engineMap[engName])}
          </div>
        </li>
      );
    }
    else {
      engineList = null;
    }

    return engineList;
  };


  
  let focus = resourcesContext.focus;
  let serviceDetails;
  let serviceConfig;
  if (focus.category === "service-instance") {
    serviceDetails = resourcesContext.getFocusService();
    serviceConfig = serviceDetails.serviceConfig;
    if (!serviceDetails) {
      return null;
    }
  }
  else {
    /*
     * The focus is not a service-instance, so do nothing...
     */
    return null;
  }


  return (

    <div className="type-details-container">
      <div className="type-details-item-bold">ServiceName : {serviceDetails.serviceName}</div>

      <div className="type-details-item-bold">ServiceURLMarker : </div>
      <div className="type-details-item">{serviceConfig.engineServiceURLMarker}</div>
    
      <div className="type-details-item-bold">ServiceFullName :</div>
      <div className="type-details-item">{serviceConfig.engineServiceFullName}</div>

      <div className="type-details-item-bold">ServiceDescription : </div>
      <div className="type-details-item">{serviceConfig.engineServiceDescription}</div>
     
      <button className="collapsible" onClick={flipPartnerOMASSection}> Partner OMAS : {serviceConfig.engineServicePartnerOMAS} </button>
      <div className="content">
        <div className="type-details-item">OMAGServerName : {serviceConfig.omagserverName}</div>
        <div className="type-details-item">OMAGServerPlatformRootURL : {serviceConfig.omagserverPlatformRootURL}</div>
      </div>
      <br/>

      <div className="type-details-item-bold">ServiceStatus :</div>
      <div className="type-details-item">{serviceConfig.engineServiceOperationalStatus}</div>

      <button className="collapsible" onClick={flipSection}> Engines :  </button>
      <ul className="type-details-container">
       {expandEngines(serviceConfig.engines)}
      </ul>
      <br/>

      <div className="type-details-item-bold">ServiceWiki :</div>
      <div className="type-details-item">{serviceConfig.engineServiceWiki}</div>
    </div>
  );

}


EngineServiceDisplay.propTypes = {
  
};

