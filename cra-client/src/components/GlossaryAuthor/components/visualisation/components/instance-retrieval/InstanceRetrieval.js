/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState, useEffect } from "react";

import PropTypes from "prop-types";
import { IdentificationContext } from "../../../../../../contexts/IdentificationContext";
import { InstancesContext } from "../../contexts/InstancesContext";
import { withRouter } from "react-router-dom";
import "./instance-retriever.scss";
const InstanceRetrieval = (props) => {
  useEffect(
    () => {
      loadNodeByGUID();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const instancesContext = useContext(InstancesContext);
  const identificationContext = useContext(IdentificationContext);

  /*
   * Function to get node by GUID
   */
  const loadNodeByGUID = () => {
    if (props.match.url) {
      const urlSegments = props.match.url.split("/");
      const guidToLoad = urlSegments[urlSegments.length - 1];
      const secondLastSegment = urlSegments[urlSegments.length - 2];
      const nodeTypeKey = secondLastSegment.substring("visualise-".length);
      console.log("nodeTypeKey" + nodeTypeKey);

      //TODO pass through the onSuccess and onErrors
      instancesContext.loadNode(guidToLoad, nodeTypeKey);
    }
  };

  return <div className={props.className}></div>;
};

InstanceRetrieval.propTypes = {
  className: PropTypes.string,
};
export default withRouter(InstanceRetrieval);
