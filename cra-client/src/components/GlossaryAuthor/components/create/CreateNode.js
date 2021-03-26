/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import { withRouter } from "react-router-dom";
import getPathTypesAndGuids from "../properties/PathAnalyser";
import CreateNodePage from "./CreateNodePage";
import CreateNodeWizard from "./CreateNodeWizard";
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
          <CreateNodePage
            currentNodeType={nodeTypeToBeCreated}
            glossaryGuid={glossaryGuid}
          />
        )}

      {nodeTypeToBeCreated !== undefined && nodeTypeToBeCreated.key !== "glossary" && (
          <CreateNodeWizard
            currentNodeType={nodeTypeToBeCreated}
            parentCategoryGuid={parentCategoryGuid}
          />
        )}
        {/* // TODO decide whether we should default the glossary for children */}
    </div>
  );
}
export default withRouter(CreateNode);
