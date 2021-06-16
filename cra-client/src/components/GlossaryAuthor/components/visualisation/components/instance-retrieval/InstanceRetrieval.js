/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState, useEffect } from "react";

import PropTypes from "prop-types";
import { InstancesContext } from "../../contexts/InstancesContext";
import { withRouter } from "react-router-dom";
import "./instance-retriever.scss";
const InstanceRetrieval = (props) => {
  useEffect(
    () => {
      loadNodeByGUID();
    },
    []
  );

  const instancesContext = useContext(InstancesContext);

  /*
   * Function to get node by GUID
   */
  const loadNodeByGUID = () => {
      instancesContext.loadNode(props.guid, props.nodeType);
  };

  return <div className={props.className}></div>;
};

InstanceRetrieval.propTypes = {
  className: PropTypes.string,
};
export default withRouter(InstanceRetrieval);
