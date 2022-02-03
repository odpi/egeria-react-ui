/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext } from "react";

import { ServerAuthorContext } from "../../../contexts/ServerAuthorContext";
import AuthorStringList from "../../../../common/AuthorStringList";

export default function AllZonesOptions(props) {
  const {
  
     // supported zones
     supportedZoneNames,
    //  setSupportedZones,
     addSupportedZoneName,
     removeSupportedZoneByIndex,
     // default zones
     defaultZoneNames,
    //  setDefaultZoneNames,
     addDefaultZoneName,
     removeDefaultZoneByIndex,
     // publish zones
     publishZoneNames,
    //  setPublishZones,
     addPublishZoneName,
     removePublishZoneByIndex,

  } = useContext(ServerAuthorContext);

  // const clearCurrentOptionState = () => {
  //   setSupportedZones([]);
  //   setDefaultZoneNames([]);
  //   setPublishZones([]);
  // };

  // options functions
  const handleAddPublishZones = (zoneName) => {
    console.log("handleAddPublishZones() called", { zoneName });
    if (zoneName.length === 0) return;
    addPublishZoneName(zoneName);
  };
  const handleRemovePublishZones = (index) => {
    console.log("handleRemovePublishZones() called", { index });
    removePublishZoneByIndex(index);
  };

  const handleAddDefaultZones = (zoneName) => {
    console.log("handleAddDefaultZones() called", { zoneName });
    if (zoneName.length === 0) return;
    addDefaultZoneName(zoneName);
  };
  const handleRemoveDefaultZones = (index) => {
    console.log("handleRemoveDefaultZones() called", { index });
    removeDefaultZoneByIndex(index);
  };

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
            handleAddString={handleAddDefaultZones}
            handleRemoveStringAtIndex={handleRemoveDefaultZones}
            stringLabel={"Default Zones"}
            idPrefix="default-zones"
            stringValues={defaultZoneNames}
          />

          <AuthorStringList
            handleAddString={handleAddPublishZones}
            handleRemoveStringAtIndex={handleRemovePublishZones}
            stringLabel={"Publish Zones"}
            idPrefix="publish-zones"
            stringValues={publishZoneNames}
          />

          <AuthorStringList
            handleAddString={handleAddSupportedZones}
            handleRemoveStringAtIndex={handleRemoveSupportedZones}
            stringLabel={"Supported Zones"}
            idPrefix="supported-zones"
            stringValues={supportedZoneNames}
          />
        </div>
      )}
    </div>
  );
}
