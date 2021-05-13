/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import { withRouter } from "react-router-dom";
import getPathTypesAndGuids from "../properties/PathAnalyser";
import CreateGlossaryWizard from "./CreateGlossaryWizard";
import CreateCategoryWizard from "./CreateCategoryWizard";
import CreateTermWizard from "./CreateTermWizard";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";

function CreateNode(props) {
  const identificationContext = useContext(IdentificationContext);
  const [nodeTypeToBeCreated, setNodeTypeToBeCreated] = useState();
  // glossary under which to create the node
  const [glossaryGuid, setGlossaryGuid] = useState();
  // if there is a parent category pass through its guid
  const [parentCategoryGuid, setParentCategoryGuid] = useState();
  console.log("props " + JSON.stringify(props));

  useEffect(() => {
    const pathAnalysis = getPathTypesAndGuids(props.match.params.anypath);
    const pathAnalysisLength = pathAnalysis.length;
    if (pathAnalysis[0].types === "glossaries" && pathAnalysisLength > 1 ) {
      // we need to set up the glossaryGuid
      setGlossaryGuid(pathAnalysis[0].guid);
    }
    // set up the nodeType
    const lastElement = pathAnalysis[pathAnalysisLength - 1];
    const gotNodeType = getNodeType(
      identificationContext.getRestURL("glossary-author"),
      lastElement.type
    );
    setNodeTypeToBeCreated(gotNodeType);
    if (pathAnalysisLength > 1) {
      const parentElement = pathAnalysis[pathAnalysisLength - 2];
      if (parentElement.type === "category") {
        setParentCategoryGuid(parentElement.guid);
      }
    }
  }, [props]);

  console.log("CreateNode");

  return (
    <div>
      {nodeTypeToBeCreated !== undefined && nodeTypeToBeCreated.key === "glossary" && (
         <CreateGlossaryWizard
         currentNodeType={nodeTypeToBeCreated} />
        )}

      {nodeTypeToBeCreated !== undefined && nodeTypeToBeCreated.key === "term" && (
          <CreateTermWizard
            currentNodeType={nodeTypeToBeCreated}
            parentCategoryGuid={parentCategoryGuid}
          />
        )}
        {nodeTypeToBeCreated !== undefined && nodeTypeToBeCreated.key === "category" && (
          <CreateCategoryWizard
            currentNodeType={nodeTypeToBeCreated}
            parentCategoryGuid={parentCategoryGuid}
          />
        )}
        {/* // TODO decide whether we should default the glossary for children */}
    </div>
  );
}
export default withRouter(CreateNode);
