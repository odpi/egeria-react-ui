/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext} from "react";
import { IdentificationContext } from "../../../../../../contexts/IdentificationContext";
import RelationshipDisplayDetails from "../../../update/RelationshipDisplayDetails";
import getRelationshipType from "../../../properties/RelationshipTypes";

export default function RelationshipDisplay(props) {
  const identificationContext = useContext(IdentificationContext);
  const relationship = props.relationship;
  const getCurrentRelationshipType = () => {
    const relationshipType = getRelationshipType(
      identificationContext.getRestURL("glossary-author"),
      relationship.relationshipType.toLowerCase()
    );
    return relationshipType;
  };

  return (
    <div>
   <RelationshipDisplayDetails
        currentNodeType={getCurrentRelationshipType()}
        relationship={relationship}
      />
    </div>
  );
}
