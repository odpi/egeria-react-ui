/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext }                   from "react";

import { ResourcesContext }                    from "../../contexts/ResourcesContext";


import "./details-panel.scss";


export default function AccessServiceDisplay() {


  const resourcesContext = useContext(ResourcesContext);


  const formatConnection = (ec) => {
    let ret = (
      <div>
        <div>
          Display Name : {ec.displayName}
        </div>
        <div>
          Description : {ec.description}
        </div>
        <div>
          Connector Type : {ec.connectorType.displayName}
        </div>
        <div>
          Connector Provider : {ec.connectorType.connectorProviderClassName}
        </div>
        <div>
          Endpoint : {ec.endpoint.address}
        </div>
        <div>
          Configuration Properties : {ec.configurationProperties ? 
             formatConnectionConfigurationProperties(ec.configurationProperties) : <i>blank</i>}
        </div>
      </div>
    );
    return ret;
    
  }

 
  const formatConnectionConfigurationProperties = (cfgProps) => {
    return (
      <div>
      <div>
        Local Server Id : {cfgProps["local.server.id"]}
      </div>
      <div>
        Producer : { (cfgProps.producer && cfgProps.producer["bootstrap.servers"]) ? 
                        cfgProps.producer["bootstrap.servers"] : <i>blank</i>}
      </div>
      <div>
        Consumer : { (cfgProps.consumer && cfgProps.consumer["bootstrap.servers"]) ? 
                        cfgProps.consumer["bootstrap.servers"] : <i>blank</i>}
      </div>
      </div>
    )
  }

  
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
      <div className="type-details-item">{serviceConfig.accessServiceURLMarker}</div>
    
      <div className="type-details-item-bold">ServiceFullName :</div>
      <div className="type-details-item">{serviceConfig.accessServiceFullName}</div>

      <div className="type-details-item-bold">ServiceDescription : </div>
      <div className="type-details-item">{serviceConfig.accessServiceDescription}</div>

      <div className="type-details-item-bold">ServiceStatus :</div>
      <div className="type-details-item">{serviceConfig.accessServiceOperationalStatus}</div>

      <div className="type-details-item-bold">InTopic :</div>
      <div className="type-details-item">{formatConnection(serviceConfig.accessServiceInTopic)}</div>

      <div className="type-details-item-bold">OutTopic :</div>
      <div className="type-details-item">{formatConnection(serviceConfig.accessServiceOutTopic)}</div>

      <div className="type-details-item-bold">ServiceWiki :</div>
      <div className="type-details-item">{serviceConfig.accessServiceWiki}</div>
    </div>
  );

}


AccessServiceDisplay.propTypes = {
  
};

