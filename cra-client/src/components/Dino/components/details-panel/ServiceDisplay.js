/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext }                   from "react";

import { ResourcesContext }                    from "../../contexts/ResourcesContext";


import "./details-panel.scss";


export default function ServiceDisplay() {


  const resourcesContext = useContext(ResourcesContext);
 
 
  /*
   * As the user flips a partnerOMAS section, expand the service details display and add the OMAS 
   * to the gens so that it appears in the topology diagram. This does not (it cannot) resolve to a 
   * serverInstance and platform at this stage because the partnerOMAS is identified by a serverName
   * and a platformRootURL and we are not permitted to use a platformRootURL - we would need to expose
   * a REST api at the view service that accepts an URI and that is a security exposure.
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
      resourcesContext.loadPartnerOMAS(serviceInstanceGUID);
    }
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
      <div className="type-details-item">{serviceConfig.integrationServiceURLMarker}</div>
    
      <div className="type-details-item-bold">ServiceFullName :</div>
      <div className="type-details-item">{serviceConfig.integrationServiceFullName}</div>

      <div className="type-details-item-bold">ServiceDescription : </div>
      <div className="type-details-item">{serviceConfig.integrationServiceDescription}</div>
     
      <button className="collapsible" onClick={flipPartnerOMASSection}> Partner OMAS : {serviceConfig.integrationServicePartnerOMAS} </button>
      <div className="content">
        <div className="type-details-item">OMAGServerName : {serviceConfig.omagserverName}</div>
        <div className="type-details-item">OMAGServerPlatformRootURL : {serviceConfig.omagserverPlatformRootURL}</div>
      </div>
      <br/>

      <div className="type-details-item-bold">ServiceStatus :</div>
      <div className="type-details-item">{serviceConfig.integrationServiceOperationalStatus}</div>

      <div className="type-details-item-bold">ServiceWiki :</div>
      <div className="type-details-item">{serviceConfig.integrationServiceWiki}</div>
    </div>
  );

}


ServiceDisplay.propTypes = {
  
};

