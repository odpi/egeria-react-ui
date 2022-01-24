/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";

import {
  TextInput,
} from "carbon-components-react";

import AuthorStringList from "../../../../common/AuthorStringList";

export default function SupportedZoneOptions(props) {
  // supported zones
  const [addSupportedZoneName, setAddSupportedZoneName] = useState();
  const [removeSupportedZoneIndex, setRemoveSupportedZoneIndex] = useState();
  const [supportedZoneNames, setSupportedZones] = useState([]);


  // useEffect(() => {
  //   if (props.options !== undefined && Object.keys(options).length) {
  //     if (options.SupportedZones !== undefined) {
  //       setSupportedZones(options.SupportedZones);
  //     }
  //   } else {
  //     clearCurrentOptionState();
  //   }  
  // }, [props.options]);


  // Supported zones

  useEffect(() => {
    if (addSupportedZoneName !== undefined && addSupportedZoneName !== "") {
      const newSupportedZoneNames = [...supportedZoneNames, addSupportedZoneName];
      setSupportedZones(newSupportedZoneNames);
      setAddSupportedZoneName("");
    }
  }, [addSupportedZoneName]);

  useEffect(() => {
    if (removeSupportedZoneIndex !== undefined && removeSupportedZoneIndex !== "") {
      let newSupportedZoneNames = [...supportedZoneNames];
      if (removeSupportedZoneIndex > -1) {
        newSupportedZoneNames.splice(removeSupportedZoneIndex, 1);
        setSupportedZones(newSupportedZoneNames);
        setRemoveSupportedZoneIndex("");
      }
    }
  }, [removeSupportedZoneIndex]);

  useEffect(() => {
    // update the current options (the rest body) in the caller
    let options = {};
    if (supportedZoneNames !== undefined && supportedZoneNames.length > 0) {
      options.SupportedZones = supportedZoneNames;
    }
    if (!Object.keys(options).length) {
      options = undefined;
    }
    props.onCurrentOptionsChanged(options);
  }, [supportedZoneNames]);

  const clearCurrentOptionState = () => {
    // supported zones
    setAddSupportedZoneName(undefined);
    setRemoveSupportedZoneIndex(undefined);
    setSupportedZones([]);
   
  };

  // options functions

  const handleAddSupportedZones = (zoneName) => {
    console.log("handleAddSupportedZones() called", { zoneName });
    if (zoneName.length === 0) return;
    setAddSupportedZoneName(zoneName);
  };
  const handleRemoveSupportedZones = (index) => {
    console.log("handleRemoveSupportedZones() called", { index });
    setRemoveSupportedZoneIndex(index);
  };

  return (
    <div className="left-text">
      {props.operation === "Edit" && <h4>Edit Access Service</h4>}

      {props.operation !== null  &&  props.operation !==  "" && (
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