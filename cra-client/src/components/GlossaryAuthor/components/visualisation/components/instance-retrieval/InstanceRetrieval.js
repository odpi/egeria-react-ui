/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState } from "react";

import PropTypes                       from "prop-types";
import { IdentificationContext } from "../../../../../../contexts/IdentificationContext";
import { InstancesContext }            from "../../contexts/InstancesContext";
import { withRouter } from "react-router-dom";
import "./instance-retriever.scss"
import getNodeType from "../../../properties/NodeTypes";
const InstanceRetrieval = props => {

  const instancesContext                      = useContext(InstancesContext);
  const identificationContext = useContext(IdentificationContext);

    /*
   * Function to get node by GUID 
   */
  const loadNodeByGUID = () => {    
      const urlSegments = props.match.url.split("/")
      const guidToLoad = urlSegments[urlSegments.length - 1];
      const secondLastSegment =   urlSegments[urlSegments.length - 2];
      const nodeTypeKey = secondLastSegment.substring("visualise-".length);
      console.log("nodeTypeKey" + nodeTypeKey);
    
      const nodeType = getNodeType(identificationContext.getRestURL("glossary-author"), nodeTypeKey);
      console.log("nodeType" + nodeType);
      instancesContext.loadNode(guidToLoad, nodeType);

  };

  return (
    
    <div className={props.className}>
        {loadNodeByGUID()}
       
    </div>     
  
  );

}

InstanceRetrieval.propTypes = { 
  className  : PropTypes.string
}
export default withRouter(InstanceRetrieval);
