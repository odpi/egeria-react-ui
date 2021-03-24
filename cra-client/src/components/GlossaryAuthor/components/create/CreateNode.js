/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import { withRouter } from "react-router-dom";
import getPathTypesAndGuids from "../properties/PathAnalyser";
import CreateNodeUnderGlossary from "./CreateNodeUnderGlossary";
import CreateNodeWizard from "./CreateNodeWizard";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";

function CreateNode(props) {
  const identificationContext = useContext(IdentificationContext);
  const [nodeType, setNodeType] = useState();
  const [glossaryGuid, setGlossaryGuid] = useState();
  console.log("props " + JSON.stringify(props));

  useEffect(
    () => {
        const pathAnalysis = getPathTypesAndGuids(props.match.params.anypath);
        if (pathAnalysis[0].types === "glossaries" ) {
            // we need to set up the glossaryGuid
            setGlossaryGuid(pathAnalysis[0].guid);
        }    
        // set up the nodeType
        const lastElement = pathAnalysis[pathAnalysis.length -1];
        const gotNodeType = getNodeType(identificationContext.getRestURL("glossary-author"), lastElement.type);
        setNodeType(gotNodeType);
    }, 
    [props] 
  )

  console.log("CreateNode");

  return (
    <div>
        {nodeType !== undefined && nodeType.key === "glossary" &&
          <CreateNodeUnderGlossary currentNodeType={nodeType} glossaryGuid={glossaryGuid}/>
        }    
        {nodeType !== undefined && nodeType.key !== "glossary" &&
          <CreateNodeWizard currentNodeType={nodeType} />
        }      
    </div>
  );
}
export default withRouter(CreateNode);
