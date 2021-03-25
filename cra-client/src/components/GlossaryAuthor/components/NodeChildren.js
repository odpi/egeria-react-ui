/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";

import { IdentificationContext } from "../../../contexts/IdentificationContext";
import { ContentSwitcher, Switch } from "carbon-components-react";
import GlossaryAuthorTermsNavigation from "./navigations/GlossaryAuthorTermsNavigation";
import GlossaryAuthorCategoriesNavigation from "./navigations/GlossaryAuthorCategoriesNavigation";
import GlossaryAuthorChildCategoriesNavigation from "./navigations/GlossaryAuthorChildCategoriesNavigation";
import getNodeType from "./properties/NodeTypes";
import getPathTypesAndGuids from "./properties/PathAnalyser";
import { useHistory, withRouter } from "react-router-dom";
/**
 * NodeChildren is driven by the GlossaryAuthorRoutes, with a path ending in Terms or Categories.
 * The second last segment should be the parent guid and the thrid last segment should be the parent type
 * so the current path should be ...../<plural parent type>/<parent guid>/<plural child type>
 * @param {*} props
 * @returns
 */
function NodeChildren(props) {
  const identificationContext = useContext(IdentificationContext);
  console.log("NodeChildren(props) " + props);
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  const [parentNodeTypeName, setParentNodeTypeName] = useState();
  const [parentGuid, setParentGuid] = useState();

  /**
   * this useEffect is required so that the content in the content switcher is kept in step with the url.
   * This is required when the back button is pressed returning from a child component.
   */
  useEffect(() => {
    const pathName = props.location.pathname;
    const childTypeName = pathName.substring(pathName.lastIndexOf('/') + 1);
    const pathAnalysis = getPathTypesAndGuids(props.match.params.anypath);
    // set up the nodeType

    let index = 0;
    if (childTypeName === "terms") {
      index = 1;
    }
    // set the parent information
    const parentElement = pathAnalysis[pathAnalysis.length - 1];
    setParentGuid(parentElement.guid);
    setParentNodeTypeName(parentElement.type);

    setSelectedContentIndex(index);
  });

  let history = useHistory();

  const onChange = (e) => {
    const chosenContent = `${e.name}`;
    let url = props.match.url;
    console.log("url 1 " + url);

    url = url.substring(0, url.lastIndexOf('/'));
    console.log("url 2 " + url);
    url = url + "/" + chosenContent;
    console.log("url 3 " + url);
    console.log("pushing url " + url);

    // Use replace rather than push so the content switcher changes are not navigated through the back button, which would be uninituitive.
    history.replace(url);

    if (chosenContent === "terms") {
      setSelectedContentIndex(1);
    } else {
      setSelectedContentIndex(0);
    }
  };
  const getChildrenURL = () => {
    let childName;
    if (selectedContentIndex === 1) {
      childName = "terms";
    } else {
      childName = "categories";
    } 
    const url =
      getNodeType(
        identificationContext.getRestURL("glossary-author"),
        parentNodeTypeName
      ).url +
      "/" +
      parentGuid +
      "/" +
      childName;
    console.log("getChildrenURL url " + url);
    return url;
  };

  return (
    <div>
      <ContentSwitcher selectedIndex={selectedContentIndex} onChange={onChange}>
        <Switch name="categories" text="Categories" />
        <Switch name="terms" text="Terms" />
      </ContentSwitcher>

      {selectedContentIndex === 0 &&
        parentNodeTypeName === "glossary" && (
          <GlossaryAuthorCategoriesNavigation
            getCategoriesURL={getChildrenURL()}
          />
        )}
      {selectedContentIndex === 0 &&
        parentNodeTypeName === "category" && (
          <GlossaryAuthorChildCategoriesNavigation
            getCategoriesURL={getChildrenURL()}
          />
        )}
      {selectedContentIndex === 1 && (
        <GlossaryAuthorTermsNavigation getTermsURL={getChildrenURL()} />
      )}
    </div>
  );
}
export default withRouter(NodeChildren);
