/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";

import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import Add32 from "../../../../images/carbon/Egeria_add_32";
import Delete32 from "../../../../images/carbon/Egeria_delete_32";
import Edit32 from "../../../../images/carbon/Egeria_edit_32";
import DataVis32 from "../../../../images/carbon/Egeria_datavis_32";
import ParentChild32 from "../../../../images/carbon/Egeria_parent_child_32";

import Term32 from "../../../../images/odpi/Egeria_term_32";

import { LocalNodeCard, NodeCardSection } from "../NodeCard/NodeCard";
import { withRouter } from "react-router-dom";
import { Pagination, Toggle } from "carbon-components-react";
import NodeTableView from "../views/NodeTableView";

import getNodeType from "../properties/NodeTypes.js";
import { issueRestGet, issueRestDelete } from "../../../common/RestCaller";

import { Link } from "react-router-dom";

const GlossaryAuthorCategoriesNavigation = (props) => {
  const identificationContext = useContext(IdentificationContext);
  const [nodes, setNodes] = useState([]);
  const [errorMsg, setErrorMsg] = useState();
  const [selectedNodeGuid, setSelectedNodeGuid] = useState();
  const [selectedNodeReadOnly, setSelectedNodeReadOnly] = useState(true);
  const [onlyTop, setOnlyTop] = useState(false);
  const [isCardView, setIsCardView] = useState(true);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [results, setResults] = useState([]);

  console.log("GlossaryAuthorCategoriesNavigation " + props);

  const nodeType = getNodeType(identificationContext.getRestURL("glossary-author"), "category");
  // issue a new rest call to get children if the user has changed the state of the ui.
  useEffect(() => {
    getChildren();
  }, [selectedNodeGuid, onlyTop, pageSize, pageNumber]);
  // refresh the nodes if the results - from the get children rest call completed
  useEffect(() => {
    refreshNodes();
  }, [results]);

  const getChildren = () => {
    // encode the URI. Be aware the more recent RFC3986 for URLs makes use of square brackets which are reserved (for IPv6)
    // this rest URL is for category children of a glossary
   if (props.getCategoriesRestURL !== undefined ) {
      const restURL = encodeURI(props.getCategoriesRestURL + "?onlyTop=" + onlyTop + "&pageSize=" + (pageSize+1) + "&startingFrom="+((pageNumber-1)*pageSize));
      issueRestGet(restURL, onSuccessfulGetChildren, onErrorGetChildren);
   }
  };

  const getSelectedNodeFromServer = (guid) => {
    // encode the URI. Be aware the more recent RFC3986 for URLs makes use of square brackets which are reserved (for IPv6)

    const restURL = encodeURI(nodeType.url + "/" + guid);
    issueRestGet(restURL, onSuccessfulGetSelectedNode, onErrorGetSelectedNode);
  };

  const onSuccessfulGetSelectedNode = (json) => {
    setErrorMsg("");
    console.log("onSuccessful get selected node " + json.result);
    // setResults(json.result);
    const node = json.result[0];
    let readOnly = false;
    if (node.readOnly) {
      readOnly = true;
    }
    setSelectedNodeReadOnly(readOnly);
  };

  const onErrorGetSelectedNode = (msg) => {
    console.log("Error on get selected node " + msg);
    setErrorMsg(msg);
    setResults([]);
  };


  const onToggleTop = () => {
    console.log("onToggleTop");
    if (onlyTop) {
      setOnlyTop(false);
    } else {
      setOnlyTop(true);
    }
  };
  const paginationProps = () => ({
    disabled: false,
    page: pageNumber,
    pagesUnknown: true,
    pageInputDisabled: false,
    backwardText: "Previous page",
    forwardText: "Next page",
    totalItems: total,
    pageSize: pageSize,
    pageSizes: [5, 10, 50, 100],
    itemsPerPageText: "Items per page:",
    onChange: onPagination,
  });
  // driven when pagination options have changed - page size or page number
  const onPagination = (options) => {
    console.log("onPaginationChange");
    console.log(options);
    // save the pagination options in state
    //setPaginationOptions(options);
    setPageSize(options.pageSize);
    setPageNumber(options.page);
  };

  // Refresh the displayed nodes search results
  // this involves taking the results and pagination options and calculating nodes that is the subset needs to be displayed

  function refreshNodes() {
    let selectedInResults = false;
    setTotal(results.length);
    if (results.length > pageSize) {
      // remove the last element.  
      results.pop();
    }
    if (results && results.length > 0) {
      results.map(function (row) {
        row.id = row.systemAttributes.guid;
        if (selectedNodeGuid && selectedNodeGuid === row.id) {
          row.isSelected = true;
          selectedInResults = true;
        }
        return row;
      });
      setNodes(results);
    } else {
      setNodes([]);
    }
    // we have selectedNode but it is not in the search results - we must have deleted it.
    if (!selectedInResults) {
      setSelectedNodeGuid(undefined);
      setSelectedNodeReadOnly(true);
    }
  }
  const onToggleCard = () => {
    console.log("onToggleCard");
    if (isCardView) {
      setIsCardView(false);
    } else {
      setIsCardView(true);
    }
  };

  const onClickDelete = () => {
    setErrorMsg("");
    console.log("Delete");
    if (selectedNodeGuid) {
      nodes.forEach(deleteIfSelected);
    }
  };
  /**
   * Delete the supplied category if it's guid matches the selected one.
   * @param {*} category
   */
  const deleteIfSelected = (category) => {
    if (category.systemAttributes.guid === selectedNodeGuid) {
      const guid = selectedNodeGuid;
      const url = nodeType.url + "/" + guid;
      issueRestDelete(url, onSuccessfulDelete, onErrorDelete);
    }
  };

  const onSuccessfulDelete = () => {
    setSelectedNodeGuid(undefined);
    setSelectedNodeReadOnly(true);
    // get the children again
    getChildren();
  };

  const onErrorDelete = (msg) => {
    console.log("Error on delete " + msg);
    setErrorMsg(msg);
  };

  const onSuccessfulGetChildren = (json) => {
    setErrorMsg("");
    console.log("onSuccessfulGetChildren " + json.result);
    setResults(json.result);

  };

  const onErrorGetChildren = (msg) => {
    console.log("Error on get children " + msg);
    setErrorMsg(msg);
    setResults([]);
  };

  function getAddCategoryUrl() {
    console.log("getAddCategoryUrl " + props);
    return props.match.url + "/add";
  }
  function getEditNodeUrl() {
    return props.match.url + "/" + selectedNodeGuid + "/edit";
  }
  function getGraphNodeUrl() {
    return props.match.url + "/" + selectedNodeGuid + "/visualise";
  }
  function getSelectedCategoryChildrenURL() {
    // default to categories
    return props.match.url + "/" + selectedNodeGuid + "/categories";
  }
  const isSelected = (nodeGuid) => {
    return nodeGuid === selectedNodeGuid;
  };
  const setSelected = (nodeGuid) => {
    setSelectedNodeGuid(nodeGuid);
    if (nodeGuid) {
      getSelectedNodeFromServer(nodeGuid);
    }
  };


  return (
    <div>
      <div className="bx--grid">
        <NodeCardSection>
          <article className="node-card__controls bx--col-sm-4 bx--col-md-1 bx--col-lg-3 bx--col-xlg-3 bx--col-max-2">
            <div className="bx--row">
              <Link to={getAddCategoryUrl}>
                <Add32 kind="primary" />
              </Link>
              {selectedNodeGuid && (
                <Link to={getSelectedCategoryChildrenURL}>
                  <ParentChild32 kind="primary" />
                </Link>
              )}
              {selectedNodeGuid && (selectedNodeReadOnly === false) && (
                <Link to={getEditNodeUrl()}>
                  <Edit32 kind="primary" />
                </Link>
              )}
              {selectedNodeGuid && (
                <Link to={getGraphNodeUrl()}>
                   <DataVis32 kind="primary" />
                </Link>
              )}
               
              {selectedNodeGuid  && (selectedNodeReadOnly === false) && <Delete32 onClick={() => onClickDelete()} />}
            </div>
          </article>
        </NodeCardSection>
        <Toggle
          aria-label="topCategoryToggle"
          defaultToggled
          labelA="All Categories"
          labelB="Top Categories"
          id="category-filter-toggle"
          onToggle={onToggleTop}
        />
        <NodeCardSection className="landing-page__r3">
          <Toggle
            aria-label="nodeCardTableToggle"
            defaultToggled
            labelA="Table View"
            labelB="Card View"
            id="node-cardtable-toggle"
            onToggle={onToggleCard}
          />
        </NodeCardSection>
        <NodeCardSection className="landing-page__r3">
          <article style={{ color: "red" }}>{errorMsg}</article>
        </NodeCardSection>
        {isCardView && (
          <NodeCardSection className="landing-page__r3">
            {nodes.map((node) => (
              <LocalNodeCard
                key={node.systemAttributes.guid}
                heading={node.name}
                guid={node.systemAttributes.guid}
                body={node.description}
                icon={<Term32 />}
                isSelected={isSelected(node.systemAttributes.guid)}
                setSelected={setSelected}
              />
            ))}
          </NodeCardSection>
        )}

        {!isCardView && (
          <NodeTableView
            nodeType={nodeType}
            nodes={nodes}
            setSelected={setSelected}
          />
        )}
        {nodes.length === 0 && <div>No {nodeType.plural} found!</div>}
        {nodes.length > 0 && (
          <div className="search-item">
            <Pagination {...paginationProps()} />
          </div>
        )}
      </div>
    </div>
  );
};
export default withRouter(GlossaryAuthorCategoriesNavigation);