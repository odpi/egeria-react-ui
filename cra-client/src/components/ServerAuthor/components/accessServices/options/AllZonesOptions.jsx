/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";

import {
  TextInput,
} from "carbon-components-react";

import AuthorStringList from "../../../../common/AuthorStringList";

export default function AllZonesOptions(props) {
  // supported zones
  const [addSupportedZoneName, setAddSupportedZoneName] = useState();
  const [removeSupportedZoneIndex, setRemoveSupportedZoneIndex] = useState();
  const [supportedZoneNames, setSupportedZones] = useState([]);
  // default zones
  const [addDefaultZoneName, setAddDefaultZoneName] = useState();
  const [removeDefaultZoneIndex, setRemoveDefaultZoneIndex] = useState();
  const [defaultZoneNames, setDefaultZoneNames] = useState([]);
  // publish zones
  const [addPublishZoneName, setAddPublishZoneName] = useState();
  const [removePublishZoneIndex, setRemovePublishZoneIndex] = useState();
  const [publishZoneNames, setPublishZones] = useState([]);

  // Default zones
  useEffect(() => {
    if (addDefaultZoneName !== undefined && addDefaultZoneName !== "") {

      const newDefaultZoneNames = [...defaultZoneNames, addDefaultZoneName];
      setDefaultZoneNames(newDefaultZoneNames);
      setAddDefaultZoneName("");
    }
  }, [addDefaultZoneName]);

  useEffect(() => {
    if (removeDefaultZoneIndex !== undefined && removeDefaultZoneIndex !== "") {
      let newdefaultZoneNames = [...defaultZoneNames];
   
      if (removeDefaultZoneIndex > -1) {
        newDefaultZoneNames.splice(removeDefaultZoneIndex, 1);
        setDefaultZoneNames(newDefaultZoneNames);
        setRemoveDefaultZoneIndex("");
      }
    }
  }, [removeDefaultZoneIndex]);

  // useEffect(() => {
  //   if (props.options !== undefined && Object.keys(options).length) {
  //     if(options.DefaultZoneNames !== undefined) {
  //         setDefaultZoneNames(options.DefaultZoneNames);
  //     }
  //     if (options.SupportedZones !== undefined) {
  //       setSupportedZones(options.SupportedZones);
  //     }
  //     if (options.PublishZones !== undefined) {
  //       setPublishZones(options.PublishZones);   
  //     }
  //   } else {
  //     clearCurrentOptionState();
  //   }  
  // }, [props.options]);

  // Publish zones
  useEffect(() => {
    if (addPublishZoneName !== undefined && addPublishZoneName !== "") {
      const newPublishZoneNames = [...publishZoneNames, addPublishZoneName];
      setPublishZones(newPublishZoneNames);
      setAddPublishZoneName("");
    }
  }, [addPublishZoneName]);

  useEffect(() => {
    if (removePublishZoneIndex !== undefined && removePublishZoneIndex !== "") {
      let newPublishZoneNames = [...publishZoneNames];
      if (removePublishZoneIndex > -1) {
        newPublishZoneNames.splice(removePublishZoneIndex, 1);
        setPublishZones(newPublishZoneNames);
        setRemovePublishZoneIndex("");
      }
    }
  }, [removePublishZoneIndex]);

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
    if (defaultZoneNames !== undefined && defaultZoneNames.length > 0) {
      options.defaultZoneNames = defaultZoneNames;
    }
    if (supportedZoneNames !== undefined && supportedZoneNames.length > 0) {
      options.SupportedZones = supportedZoneNames;
    }
    if (publishZoneNames !== undefined && publishZoneNames.length > 0) {
      options.PublishZones = publishZoneNames;
    }

    if (!Object.keys(options).length) {
      options = undefined;
    }
    props.onCurrentOptionsChanged(options);
  }, [supportedZoneNames, publishZoneNames, defaultZoneNames]);

  const clearCurrentOptionState = () => {
    // supported zones
    setAddSupportedZoneName(undefined);
    setRemoveSupportedZoneIndex(undefined);
    setSupportedZones([]);
    // default zones
    setAddDefaultZoneName(undefined);
    setRemoveDefaultZoneIndex(undefined);
    setDefaultZoneNames([]);
    // publish zones
    setAddPublishZoneName(undefined);
    setRemovePublishZoneIndex(undefined);
    setPublishZones([]);
  };


  // options functions
  const handleAddPublishZones = (zoneName) => {
    console.log("handleAddPublishZones() called", { zoneName });
    if (zoneName.length === 0) return;
    setAddPublishZoneName(zoneName);
  };
  const handleRemovePublishZones = (index) => {
    console.log("handleRemovePublishZones() called", { index });
    setRemovePublishZoneIndex(index);
  };

  const handleAddDefaultZones = (zoneName) => {
    console.log("handleAddDefaultZones() called", { zoneName });
    if (zoneName.length === 0) return;
    setAddDefaultZoneName(zoneName);
  };
  const handleRemoveDefaultZones = (index) => {
    console.log("handleRemoveDefaultZones() called", { index });
    setRemoveDefaultZoneIndex(index);
  };

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