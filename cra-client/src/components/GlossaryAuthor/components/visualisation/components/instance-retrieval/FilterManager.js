/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React from "react";

import PropTypes from "prop-types";

import "./filter.scss";

/*
 * When FilterManager is rendered it populates the type selectors with types.
 *
 * The node and line type selectors allow the user to select a single type,
 * to be used on the search.
 */

export default function FilterManager(props) {
  // leave off project for now
  const nodeTypes = ["Category", "Glossary", "Term"];
  const lineTypes = [
    "TermAnchor",
    "CategoryAnchor",
    "HasA",
    "RelatedTerm",
    "Synonym",
    "Antonym",
    "PreferredTerm",
    "ReplacementTerm",
    "Translation",
    "IsA",
    "ValidValue",
    "UsedInContext",
    "IsATypeOf",
    "TypedBy",
    "Categorization",
    // "SemanticAssignment",
    // "LibraryCategoryReference",
    // "LibraryTermReference",
    // "ProjectScope",
    "CategoryHierarchyLink",
  ];

  const nodeSelectorHandler = (e) => {
    const typeName = e.target.value;
    typeSelected("Node", typeName);
  };

  const lineSelectorHandler = (e) => {
    const typeName = e.target.value;
    typeSelected("Line", typeName);
  };

  /*
   * The type selectors are cross-coupled - node selection clears
   * lines selector and v.v.
   */
  const typeSelected = (category, typeName) => {
    switch (category) {
      case "Node":
        resetLineTypeSelector();
        break;
      case "Line":
        resetNodeTypeSelector();
        break;
      default:
        alert("Unexpected category detected in typeSelected: " + category);
        break;
    }
    props.typeSelected(category, typeName);
  };

  /*
   * Reset the node type selector
   */
  const resetNodeTypeSelector = () => {
    const selector = document.getElementById("nodeTypeSelector");
    selector.value = "none";
  };

  /*
   * Reset the line type selector
   */
  const resetLineTypeSelector = () => {
    const selector = document.getElementById("lineTypeSelector");
    selector.value = "none";
  };

  return (
    <div className="filterControls">
      <label htmlFor="nodeTypeSelector">Node Types: </label>
      <select
        className="typeSelector"
        id="nodeTypeSelector"
        name="nodeTypeSelector"
        onChange={nodeSelectorHandler}
      >
        <option value="none" defaultValue>
          Restrict search to a selected type...
        </option>

        {nodeTypes.map((typeName) => (
          <option key={typeName} value={typeName}>
            {" "}
            {typeName}{" "}
          </option>
        ))}
      </select>

      <br />

      <label htmlFor="lineTypeSelector">Line types: </label>
      <select
        className="typeSelector"
        id="lineTypeSelector"
        name="lineTypeSelector"
        onChange={lineSelectorHandler}
      >
        <option value="none" defaultValue>
          Restrict search to a selected type...
        </option>

        {lineTypes.map((typeName) => (
          <option key={typeName} value={typeName}>
            {" "}
            {typeName}{" "}
          </option>
        ))}
      </select>
    </div>
  );
}

FilterManager.propTypes = {
  searchCategory: PropTypes.string,
  typeSelected: PropTypes.func.isRequired,
  clsChanged: PropTypes.func.isRequired,
};
