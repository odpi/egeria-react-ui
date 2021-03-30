/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext, useEffect } from "react";
import getPathTypesAndGuids from "../properties/PathAnalyser";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";
import GlossaryAuthorVisualisation from "../visualisation/GlossaryAuthorVisualisation";

export default function GlossaryAuthorGraphNavigation(props) {
  const identificationContext = useContext(IdentificationContext);
  const [nodeType, setNodeType] = useState();
  const [guid, setGuid] = useState();

  useEffect(() => {
    const pathAnalysis = getPathTypesAndGuids(props.match.params.anypath);
    // we need to set up the nodeType and guid

    const lastElement = pathAnalysis[pathAnalysis.length - 1];
    setGuid(lastElement.guid);
    const gotNodeType = getNodeType(
      identificationContext.getRestURL("glossary-author"),
      lastElement.type
    );
    setNodeType(gotNodeType, identificationContext);
  }, [props, identificationContext]);
  return (
    <div>
      {nodeType !== undefined && (
        <GlossaryAuthorVisualisation nodeType={nodeType} guid={guid} />
      )}
    </div>
  );
}
