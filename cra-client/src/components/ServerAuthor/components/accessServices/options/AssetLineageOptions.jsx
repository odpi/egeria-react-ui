/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext } from "react";

import { TextInput } from "carbon-components-react";
import { ServerAuthorContext } from "../../../contexts/ServerAuthorContext";

import AuthorStringList from "../../../../common/AuthorStringList";

export default function AssetLineageOptions(props) {
  const {
     // supported zones
     supportedZoneNames,
    //  setSupportedZones,
     addSupportedZoneName,
     removeSupportedZoneByIndex,
  
     // chunk
     glossaryTermLineageEventsChunkSize,
     setGlossaryTermLineageEventsChunkSize

  } = useContext(ServerAuthorContext);

  // const clearCurrentOptionState = () => {
  //   setSupportedZones([]);
  //   setDefaultZoneNames([]);
  //   setPublishZones([]);
  // };

  // options functions


  const handleAddSupportedZones = (zoneName) => {
    console.log("handleAddSupportedZones() called", { zoneName });
    if (zoneName.length === 0) return;
    addSupportedZoneName(zoneName);
  };
  const handleRemoveSupportedZones = (index) => {
    console.log("handleRemoveSupportedZones() called", { index });
    removeSupportedZoneByIndex(index);
  };

  return (
    <div className="left-text">
      {props.operation === "Edit" && <h4>Edit Access Service</h4>}

      {props.operation !== null && props.operation !== "" && (
        <div>

          <AuthorStringList
            handleAddString={handleAddSupportedZones}
            handleRemoveStringAtIndex={handleRemoveSupportedZones}
            stringLabel={"Supported Zones"}
            idPrefix="supported-zones"
            stringValues={supportedZoneNames}
          />

   
          <TextInput
                id="GlossaryTermLineageEventsChunkSize"
                name="GlossaryTermLineageEventsChunkSize"
                type="number"
                labelText="Glossary Term Lineage Events Chunk Size"
                value={glossaryTermLineageEventsChunkSize}
                onChange={(e) => setGlossaryTermLineageEventsChunkSize(e.target.value)}
                style={{ marginBottom: "16px", width: "100%" }}
                autoComplete="off"
              />
        </div>
      )}
    </div>
  );
}
