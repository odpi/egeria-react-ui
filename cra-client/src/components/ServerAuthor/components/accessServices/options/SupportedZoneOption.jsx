/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext } from "react";
import AuthorStringList from "../../../../common/AuthorStringList";

export default function AllZonesOptions(props) {
  const {
  
    currentAccessServiceId,
    setCurrentAccessServiceId,
    currentAccessServiceOptions,
    setCurrentAccessServiceOptions,
     // supported zones
     supportedZoneNames,
    //  setSupportedZones,
     addSupportedZoneName,
     removeSupportedZoneByIndex,

  } = useContext(ServerAuthorContext);

  // const clearCurrentOptionState = () => {
  //   setSupportedZones([]);
  //   setDefaultZoneNames([]);
  //   setPublishZones([]);


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
        </div>
      )}
    </div>
  );
}
