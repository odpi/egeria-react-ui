/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import { Breadcrumb, BreadcrumbItem } from "carbon-components-react";
import { useLocation, withRouter, Link } from "react-router-dom";

function GlossaryAuthorBreadCrumb(props) {
  console.log("GlossaryAuthorBreadCrumb ");
  let location = useLocation();
  const [breadcrumbMap, setBreadcrumbMap] = useState({});

  useEffect(() => {
    console.log(`You changed the page to: ${location.pathname}`);
    // /aaa/glossary-author
    // followed by
    // 1) plural type
    // 2) or { plural type / guid } *
    // 3) 2 followed by plural type
    // then optionally there can be an action after the above url

    let breadCrumbArray = [];
    let segments = location.pathname.split("/");


    const lastSegment = segments.pop();
    // remove the first segment is blank
    if (segments[0] === "") {
      segments.shift();
    }
    let url = "";
    for (var i = 0; i < segments.length; i++) {
      let segment = segments[i];
      if (i === 0) {
        // tenant
        url = url + "/" + segment;
      } else if (i === 1) {
        // server
        url = url + "/" + segment;
      } else if (
        segment === "glossaries" ||
        segment === "categories" ||
        segment === "terms"
      ) {
        // plural type
        let typesCrumb = {};
        typesCrumb.name = segments[i];
        url = url + "/" + segment;
        typesCrumb.url = url;
        breadCrumbArray.push(typesCrumb);

        // the next segment is either a guid or does not exist
        i++;
        if (i < segments.length) {
          // must have a guid
          let guidCrumb = {};
          segment = segments[i];
          guidCrumb.name = segment;
          url = url + "/" + segment;
          guidCrumb.url = url + "/edit";
          breadCrumbArray.push(guidCrumb);
        }
      }
    }
    // lets process the last segment, which is either a plural type or an action.

    let lastCrumb = {};
    lastCrumb.name = lastSegment;
    url = url + "/" + lastSegment;
    lastCrumb.url = url;
    breadCrumbArray.push(lastCrumb);
    setBreadcrumbMap(breadCrumbArray);
  }, [location]);

  return (
    <div>
      <Breadcrumb>
        {breadcrumbMap &&
          breadcrumbMap.length > 0 &&
          breadcrumbMap.map((crumb) => {
            return (
              <BreadcrumbItem key={crumb.url}>
                <Link to={crumb.url}>{crumb.name}</Link>
              </BreadcrumbItem>
            );
          })}
      </Breadcrumb>
    </div>
  );
}
export default withRouter(GlossaryAuthorBreadCrumb);
