/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext }                   from "react";

import { ResourcesContext }                    from "../../contexts/ResourcesContext";


import "./details-panel.scss";


export default function ViewServiceDisplay() {


  const resourcesContext = useContext(ResourcesContext);



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
      <div className="type-details-item">{serviceConfig.viewServiceURLMarker}</div>
    
      <div className="type-details-item-bold">ServiceFullName :</div>
      <div className="type-details-item">{serviceConfig.viewServiceFullName}</div>

      <div className="type-details-item-bold">ServiceDescription : </div>
      <div className="type-details-item">{serviceConfig.viewServiceDescription}</div>

      <div className="type-details-item-bold">ServiceStatus :</div>
      <div className="type-details-item">{serviceConfig.viewServiceOperationalStatus}</div>

      <div className="type-details-item-bold">ServiceWiki :</div>
      <div className="type-details-item">{serviceConfig.viewServiceWiki}</div>
    </div>
  );

}


ViewServiceDisplay.propTypes = {
  
};

