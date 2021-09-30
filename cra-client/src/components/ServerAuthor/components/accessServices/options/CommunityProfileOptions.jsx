/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext, useState, useEffect } from "react";

import {
  TextInput,
} from "carbon-components-react";

import AuthorStringList from "../../../../common/AuthorStringList";

export default function ConfigureAccessServices(props) {
  // supported zones
  const [addSupportedZoneName, setAddSupportedZoneName] = useState();
  const [removeSupportedZoneIndex, setRemoveSupportedZoneIndex] = useState();
  const [supportedZoneNames, setSupportedZones] = useState([]);
  // default zones
  const [addDefaultZoneName, setAddDefaultZoneName] = useState();
  const [removeDefaultZoneIndex, setRemoveDefaultZoneIndex] = useState();
  const [defaultZones, setDefaultZones] = useState([]);
  // publish zones
  const [addPublishZoneName, setAddPublishZoneName] = useState();
  const [removePublishZoneIndex, setRemovePublishZoneIndex] = useState();
  const [publishZoneNames, setPublishZones] = useState([]);
  // Karma Point Plateau
  const [newKarmaPointPlateau, setKarmaPointPlateau] = useState();
  // Karma Point Increment
  const [newKarmaPointIncrement, setKarmaPointIncrement] = useState();

  // Default zones
  useEffect(() => {
    if (addDefaultZoneName !== undefined && addDefaultZoneName !== "") {

      const newDefaultZones = [...defaultZones, addDefaultZoneName];
      setDefaultZones(newDefaultZones);
      setAddDefaultZoneName("");
    }
  }, [addDefaultZoneName]);

  useEffect(() => {
    if (removeDefaultZoneIndex !== undefined && removeDefaultZoneIndex !== "") {
      let newDefaultZones = [...defaultZones];
   
      if (removeDefaultZoneIndex > -1) {
        newDefaultZones.splice(removeDefaultZoneIndex, 1);
        setDefaultZones(newDefaultZones);
        setRemoveDefaultZoneIndex("");
      }
    }
  }, [removeDefaultZoneIndex]);

  useEffect(() => {
    if (props.options !== undefined && Object.keys(options).length) {
      if(options.DefaultZones !== undefined) {
          setDefaultZones(options.DefaultZones);
      }
      if (options.SupportedZones !== undefined) {
        setSupportedZones(options.SupportedZones);
      }
      if (options.PublishZones !== undefined) {
        setPublishZones(options.PublishZones);   
      }
    } else {
      clearCurrentOptionState();
    }  
  }, [props.options]);

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

  const clearCurrentOptionState = () => {
    // supported zones
    setAddSupportedZoneName(undefined);
    setRemoveSupportedZoneIndex(undefined);
    setSupportedZones = useState([]);
    // default zones
    setAddDefaultZoneName(undefined);
    setRemoveDefaultZoneIndex(undefined);
    setDefaultZones([]);
    // publish zones
    setAddPublishZoneName(undefined);
    setRemovePublishZoneIndex(undefined);
    setPublishZones([]);
  };

  const  onClickIssueOperation = () => {
    const options = getAccessOptionsForBody();
    clearCurrentOptionState();
    props.onIssueOperation(options);
  };

 
/**
 * Return the options as a json object from the  
 *  
 */
  const getAccessOptionsForBody = () => {
    let options = {};
      if (defaultZones !== undefined && defaultZones.length > 0) {
        options.DefaultZones = defaultZones;
      }
      if (supportedZoneNames !== undefined && supportedZoneNames.length > 0) {
        options.SupportedZones = supportedZoneNames;
      }
      if (publishZoneNames !== undefined && publishZoneNames.length > 0) {
        options.PublishZones = publishZoneNames;
      }

    if(!Object.keys(options).length){
       options = undefined;
     }
     return options;
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
      {operation === "Add" && (
        <div>
        
            <div>
              <AuthorStringList
                handleAddString={handleAddDefaultZones}
                handleRemoveStringAtIndex={handleRemoveDefaultZones}
                stringLabel={"Default Zones"}
                idPrefix="default-zones"
                stringValues={defaultZones}
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

              <TextInput
                id="KarmaPointPlateau"
                name="KarmaPointPlateau"
                type="number"
                labelText="Karma Point Plateau"
                value={newKarmaPointPlateau}
                onChange={(e) => setKarmaPointPlateau(e.target.value)}
                invalid={newKarmaPointPlateau === ""}
                style={{ marginBottom: "16px", width: "100%" }}
                autoComplete="off"
              />
              <TextInput
                id="KarmaPointIncrement"
                name="KarmaPointIncrement"
                type="number"
                labelText="Karma Point Increment"
                value={newKarmaPointIncrement}
                onChange={(e) => setKarmaPointIncrement(e.target.value)}
                style={{ marginBottom: "16px", width: "100%" }}
                autoComplete="off"
              />
            </div>
        </div>
      )}
      {operation === "Edit" && <h4>Edit Access Service</h4>}

      {operation !== undefined && (
        <fieldset className="bx--fieldset left-text-bottom-margin-32">
          <button onClick={(e) => props.onCancelOperation()}>
            Cancel {operation}
          </button>
          <button onClick={(e) => onClickIssueOperation()}>
            Issue {operation}
          </button>
        </fieldset>
      )}
   
    </div>
  );
}
