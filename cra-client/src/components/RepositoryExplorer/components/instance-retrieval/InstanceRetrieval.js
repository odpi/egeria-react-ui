/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState } from "react";

import PropTypes from "prop-types";

import { InstancesContext } from "../../contexts/InstancesContext";

import "./instance-retriever.scss";

export default function InstanceRetrieval(props) {
  const instancesContext = useContext(InstancesContext);

  const [categoryToLoad, setCategoryToLoad] = useState("Entity");
  const [guidToLoad, setGuidToLoad] = useState("");

  /*
   * Handler for radio buttons to select category for load by GUID
   */
  const changeCategory = (evt) => {
    if (categoryToLoad === "Entity") {
      setCategoryToLoad("Relationship");
    } else {
      setCategoryToLoad("Entity");
    }
  };

  /*
   * Handler for change to instance GUID field
   */
  const updatedGuidToLoad = (evt) => {
    setGuidToLoad(evt.target.value);
  };

  /*
   * Function to get entity by GUID from the repository
   */
  const loadInstanceByGUID = () => {
    if (categoryToLoad === "Entity") {
      instancesContext.loadEntity(guidToLoad);
    } else {
      instancesContext.loadRelationship(guidToLoad);
    }
  };

  return (
    <div className={props.className}>
      <div className="retrieval-controls">
        <div className="retrieval-fields">
          <p className="descriptive-text">Get an instance by GUID</p>

          <label htmlFor="category">Category: </label>
          <input
            type="radio"
            id="catEntity"
            name="category"
            value="Entity"
            checked={categoryToLoad === "Entity"}
            onChange={changeCategory}
          />
          <label htmlFor="catEntity">Entity</label>

          <input
            type="radio"
            id="catRelationship"
            name="category"
            value="Relationship"
            checked={categoryToLoad === "Relationship"}
            onChange={changeCategory}
          />
          <label htmlFor="catRelationship">Relationship</label>

          <br />

          <label htmlFor="instanceGUIDField">Instance GUID: </label>
          <input
            name="instanceGUIDField"
            value={guidToLoad}
            onChange={updatedGuidToLoad}
          ></input>
          <br />
        </div>
        <div>

          <button className="retrieval-button" onClick={loadInstanceByGUID}>
            Get instance by GUID
          </button>
        </div>
      </div>
    </div>
  );
}

InstanceRetrieval.propTypes = {
  className: PropTypes.string,
};
