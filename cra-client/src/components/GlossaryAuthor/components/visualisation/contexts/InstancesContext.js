/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { createContext, useContext, useState, useCallback } from "react";

import PropTypes from "prop-types";
import { issueRestGet } from "../../RestCaller";
import getNodeType from "../../properties/NodeTypes";
import getLineType from "../../properties/LineTypes";

import { IdentificationContext } from "../../../../../contexts/IdentificationContext";

/*
 * The InstancesContext holds the state for the instances that are retrieved from the
 * repository and loaded into the graph. It also holds transient state that exists
 * following the completion of a search and the selection by the user of which searched
 * instances they want to add to the graph.
 *
 */
export const InstancesContext = createContext();

export const InstancesContextConsumer = InstancesContext.Consumer;

const InstancesContextProvider = (props) => {
  const identificationContext = useContext(IdentificationContext);
  /*
   * The focusInstance is the instance (Node or Line) that is the user's current
   * focus. It's GUID is stored in focusInstanceGUID and its category is in focusInstanceCategory.
   * These things all move together - as demonstrated in functions such as setFocusNode().
   * When the focus instance is changed (e.g. by clicking on an instance in the diagram) the
   * whole set of focus fields is updated.
   *
   * field in the InstanceRetriever. Same for categoryToLoad. When the user presses "Get" in the
   * InstanceRetriever, the instance is retrieved from the repository and all the focus fields
   * are updated (together) as described above.
   */

  /*
   * focus is an object containing the instanceCategory, instanceGUID and the instance itself.
   */
  const [focus, setFocus] = useState({
    instanceCategory: "",
    instanceGUID: "",
    instance: null,
  });

  /*
   * setFocusNode sets the category, instance, guid for the focus instance.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const setFocusNode = useCallback((node) => {
    const newFocus = {
      instanceCategory: "Node",
      instanceGUID: node.systemAttributes.guid,
      instance: node,
    };
    setFocus(newFocus);
  }, []);

  /*
   * setFocusLine sets the category, instance, guid for the focus instance.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const setFocusLine = useCallback(
    (expLine) => {
      const newFocus = {
        instanceCategory: "Line",
        instanceGUID: expLine.line.guid,
        instance: expLine,
      };
      setFocus(newFocus);
    },
    [setFocus]
  );
  /*
   * gens
   * ----
   * This is where the previously retrieved instances are stored.
   * This is structured as an array of traversal objects. A traversal may contain a single instance
   * such as an Node that was retrieved using Get or Search, or it may contain a set of neighbours
   * that were retrieved as the result of an Explore traversal starting from an existing Node.
   * A gen (traversal) has the following fields:
   *   nodes       - a map from Node GUID to Node digest containing the instances
   *   lines  - a map from line GUID to line digest containing the instances
   *   operation      - the operation that was performed to retrieve this traversal, e.g:
   *                      "NodeSearch", "lineSearch"
   *                    This is recorded in the traversal, to provide an informative summary in history
   *   searchText     - the searchText that was used to find the set of instance in the traversal
   *                    (The search category is implicit from the operaton and the nature of the instances)
   *
   * Initial State and Progress:
   * At the start of a session, or following a clear operation (or successive undo operations) gens
   * is empty.
   * A gen is added (to the end of the array) when a retrieval (get, search-completion  or explore)
   * completes and returns one or more instances that were not already 'known' (i.e. in a previous gen).
   * The most recent gen can be removed by an Undo operation. It is removed in the second phase of Undo.
   * Gens are identified by numeric identifiers which start at 1 - they are NOT the gens array index.
   * The number of gens (previously stored as a separate field) can be found by getting the current genId.
   *
   * The gens are accessed by other componenets using the functions:
   *   getLatestActiveGenId  - returns the most recent gen number - (previously called getCurrentGen)
   *   getLatestGen          - returns the most recent gen (not necessarily an active gen)
   *   addGen                - this encapsulates extension of a gen
   *                         - this updates the gens array and the guidToGenId map too.
   *   removeGen             - this encapsulates removal of a gen
   *                         - this updates the gens array and the guidToGenId map too.
   *                         - when a gen is removed, this method also checks whether it contained the focus - in which
   *                           case the focus is cleared.
   *
   *
   * guidToGenId
   * -----------
   * In addition to the gens themselves there is a map for quick existence checking and retrieval:
   *   guidToGenId     - maps the instance (Node or line) to the identifier of the gen it is in (if any)
   *
   * Initial State and Progress:
   * At the start of a session, or following a clear operation (or successive undo operations) guidToGenId
   * is empty. An entry is added to the map when a gen is added and an entry is removed when the gen removed.
   */
  const [gens, setGens] = useState([]);
  const [guidToGenId, setGuidToGenId] = useState({});
  const [guidToNodeType, setGuidToNodeType] = useState({});
  const [guidToLineType, setGuidToLineType] = useState({});

  /*
   * The latestGenId is not just the length of the gens array - it indicates the id of the most recent
   * active generation. When the array is growing it will always be the last gen in the array. But when
   * undo or clear is used, it will be either one less than the array length, or even zero (on clear).
   */
  const [latestActiveGenId, setLatestActiveGenId] = useState(0);

  /*
   * getLatestActiveGenId  - returns the most recent gen number that is active
   */
  // const getLatestActiveGenId = useCallback(
  //   () => {
  //   return latestActiveGenId;
  // },
  // [latestActiveGenId]
  // );
  const getLatestActiveGenId = () => {
    return latestActiveGenId;
  };
  /*
   * getLatestGen  - returns the most recent gen - this may not be an active gen.
   */
  // const getLatestGen = useCallback(
  //   () => {
  //   return gens[gens.length-1];
  // },
  // [gens]
  // );
  const getLatestGen = () => {
    return gens[gens.length - 1];
  };
  /*
   * General failure reporting utility
   *
   *
   * This function provides a common utility for reporting errors to the user.
   * For now these are posted as alerts. That could be modified.
   * The 'operation' parameter should be a phrase that describes the operation in a non-technical
   * manner that matches the context and concepts the user will be familiar with. For example,
   * use a phrase like "get types for server" rather than "loadTypes".
   * The second parameter is a json response object that has the fields from the associated
   * RexViewServiceException. The main fields to note are (with example values):
   *  relatedHTTPCode                 :  400,
   *  exceptionClassName              : 'org.odpi.openmetadata.viewservices.rex.api.ffdc.RexViewServiceException',
   *  actionDescription               : 'getTypeExplorer',
   *  exceptionErrorMessage           : 'The repository explorer view service operation getTypeExplorer found that platform for server Metadata_Server2 is not available',
   *  exceptionErrorMessageId         : 'OMVS-REPOSITORY-EXPLORER-400-006',
   *  exceptionErrorMessageParameters : [ 'getTypeExplorer', 'Metadata_Server2' ],
   *  exceptionSystemAction           : 'The system reported that the platform is not reachable using the provided URL.',
   *  exceptionUserAction             : 'Check the platform is running and check the repository explorer resource endpoint configuration for the server and its platform.'
   * The exceptionErrorMessageParameters will already have been substituted into the exceptionErrorMessage,
   * so there should be no need to perform any formatting; that is all done by the view service.
   *
   */
  const reportFailedOperation = useCallback((operation, message) => {
    alert("Attempt to " + operation + " and got error: " + message);
  }, []);

  /*
   * addGen - updates the gens array and the guidToGenId map too.
   */
  const addGen = useCallback(
    (traversal) => {
      /*
       * The traversal contains new instances (nodes and/or lines) - that do
       * not already existing in previous gens.
       */

      /*
       * Do not mutate the current array - must replace for state update to register
       */
      const newList = gens.concat(traversal);
      setGens(newList);
      setLatestActiveGenId(newList.length);

      /*
       * Look for new instances in the traversal, and add them to the new gen.
       * If it was an Node that was processed, this function will only have been called if the Node
       * needs adding to the new gen - so no checking would be required. However, if it was a line
       * that was processed it carries a pair of Node digests and they may or may not have been already
       * known; the line processor will have already checked for pre-existence and set their genIds
       * accordingly.This function needs to check each Node's genId - and only add the ones for the new
       * gen.
       * If an Node is from the new gen, record it in the guidToGenId map. Lines will always be
  
       * from the new gen.
       * Because the map is immutable, corral the changes in a cloned map and apply them in one replace operation
       */
      const newGen = newList.length;
      let newEntries = Object.assign({}, guidToGenId);
      const eKeys = Object.keys(traversal.nodes);
      eKeys.forEach((e) => {
        newEntries[e] = newGen;
      });
      const rKeys = Object.keys(traversal.lines);
      rKeys.forEach((r) => {
        newEntries[r] = newGen;
      });
      /*
       * Now replace the map...
       */
      setGuidToGenId(newEntries);
    },
    [gens, setGens, guidToGenId, setGuidToGenId, setLatestActiveGenId]
  );

  /*
   * Get the GUID of the focus instance
   */
  const getFocusGUID = useCallback(() => {
    return focus.instanceGUID;
  }, [focus]);

  /*
   * Get the gen containing the focus instance
   */
  const getFocusGen = useCallback(() => {
    let focusGenId = guidToGenId[focus.instanceGUID];
    let focusGen = gens[focusGenId - 1];
    return focusGen;
  }, [guidToGenId, gens, focus.instanceGUID]);

  /*
   * Get the id of the gen containing the focus instance
   */
  const getFocusGenId = useCallback(() => {
    let focusGenId = guidToGenId[focus.instanceGUID];
    return focusGenId;
  }, [guidToGenId, focus]);

  /*
   * Functions to process retrieved instances
   */

  /*
   * processRetrievedNode accepts an node, checks whether it is already known and if not,
   * creates a traversal to add the Node to a new gen
   */
  const processRetrievedNode = (node) => {
    const nodeGUID = node.systemAttributes.guid;

    let genId;
    if (guidToGenId[nodeGUID] !== undefined) {
      /*
       * Node is already known
       */
      genId = guidToGenId[nodeGUID];
      node.gen = genId;
      addNewGuidToNodeType(nodeGUID, node.nodeType,"known retrieved node");
    } else {
      /*
       * Node is not already known
       *
       * Construct a traversal for the Node and add it to the gens.
       * The genId is in the digest and will be one beyond the current latest gen
       */
      genId = getLatestActiveGenId() + 1;
      node.gen = genId;

      let traversal = {};
      traversal.nodes = {};
      traversal.lines = {};

      let nodeDigest = {};
      nodeDigest.nodeGUID = nodeGUID;
      nodeDigest.nodeType = node.nodeType;
      nodeDigest.gen = node.gen;
      nodeDigest.name = node.name;
      traversal.nodes[nodeGUID] = nodeDigest;
      traversal.operation = "getNode";
      addNewGuidToNodeType(nodeGUID, node.nodeType,"unknown retrieved node");
      /*
       * Add the traversal to the sequence of gens in the graph.
       */
      addGen(traversal);
    }

    /*
     * Because this is processing the retrieval of a single node, that node becomes the focus
     */
    setFocusNode(node);
  };
  // Add a new entry into the guid to nodetype map.
  function addNewGuidToNodeType(guid, nodeType, msg) {
    let newGuidToNodeType = guidToNodeType;
    if (newGuidToNodeType[guid] === undefined) {
      console.log("Adding guid" + guid + ",type " + nodeType + ", msg=" + msg);
      console.log(
        "Adding guid" + guid + ",type json " + JSON.stringify(nodeType)
      );
      newGuidToNodeType[guid] = nodeType;
      setGuidToNodeType(newGuidToNodeType);
    }
  }
    // Add a new entry into the guid to nodetype map.
    function addNewGuidToLineType(guid, lineType, msg) {
      let newGuidToLineType = guidToLineType;
      if (newGuidToLineType[guid] === undefined) {
        console.log("Adding guid" + guid + ",type " + lineType + ", msg=" + msg);
        console.log(
          "Adding guid" + guid + ",type json " + JSON.stringify(lineType)
        );
        newGuidToLineType[guid] = lineType;
        setGuidToLineType(newGuidToLineType);
      }
    }

  /*
   * processRetrievedLine accepts an expLine, checks whether it is already known and if not,
   * creates a traversal to add the Line to a new gen
   */
  const processRetrievedLine = useCallback(
    (line) => {
      const lineGUID = line.systemAttributes.guid;
      const lineType = line.lineType;
      let end1 = line.end1;
      let end2 = line.end2;
      const end1GUID = end1.nodeGuid;
      const end2GUID = end2.nodeGuid;

      let genId;
      if (guidToGenId[lineGUID] !== undefined) {
        /*
         * Line is already known
         */
        genId = guidToGenId[lineGUID];
        line.gen = genId;
      } else {
        /*
         * Line is not already known
         *
         * Construct a traversal for the Line and add it to the gens.
         * The genId is in the digest and will be one beyond the current latest gen
         */
        genId = getLatestActiveGenId() + 1;
        let lineDigest = {};
        lineDigest.gen = genId;
        lineDigest.label = line.lineType;
        lineDigest.end1GUID = end1GUID;
        lineDigest.end2GUID = end2GUID;
        lineDigest.lineGUID = lineGUID;

        let traversal = {};
        traversal.nodes = {};
        traversal.lines = {};
        traversal.lines[lineGUID] = lineDigest;
        traversal.operation = "getLine";

        /*
         * We need to retrieve the end node digests from the expLine and find out
         * whether each end node is new or known, so they can either keep their gens or be
         * assigned the next gen...
         */

        /*
         * end1
         */
        const end1Digest = {};
        end1Digest.nodeGUID = end1.nodeGuid;
        end1Digest.nodeType = end1.nodeType;
        /*
         * Determine whether end1 is already known. This could loop through the gens
         * but it is slightly more efficient to use the guidToGen map as a direct index.
         */
        let end1Known = false;
        let e1gen;
        if (guidToGenId[end1GUID] !== undefined) {
          end1Known = true;
          e1gen = guidToGenId[end1GUID];
        }
        if (end1Known === false) {
          e1gen = genId;
        }
        end1Digest.gen = e1gen;

        /*
         * end2
         */
        const end2Digest = {};
        end2Digest.nodeGUID = end2.nodeGuid;
        end2Digest.nodeType = end2.nodeType;
        /*
         * Determine whether end2 is already known. This could loop through the gens
         * but it is slightly more efficient to use the guidToGen map as a direct index.
         */
        let end2Known = false;
        let e2gen;
        if (guidToGenId[end2GUID] !== undefined) {
          end2Known = true;
          e2gen = guidToGenId[end2GUID];
        }
        if (end2Known === false) {
          e2gen = genId;
        }
        end2Digest.gen = e2gen;

        /*
         * Add the node digests to the traversal ONLY if they are new in this gen
         */
        if (!end1Known) {
          traversal.nodes[end1GUID] = end1Digest;
        }
        if (!end2Known) {
          traversal.nodes[end2GUID] = end2Digest;
        }
        addNewGuidToNodeType(end1GUID, end1.nodeType, "end1");
        addNewGuidToNodeType(end2GUID, end2.nodeType, "end2");
        addNewGuidToLineType(lineGUID,lineType, "processed retrieved Line")

        /*
         * Add the traversal to the sequence of gens in the graph.
         */
        addGen(traversal);
      }

      /*
       * Because this is processing the retrieval of a single Line, that Line becomes the focus
       */
      setFocusLine(line);
    },
    [addGen, getLatestActiveGenId, guidToGenId, setFocusLine]
  );

  /*
   * processRetrievedTraversal accepts a traversal, and parses it, checking whether each instance it contains is
   * already known. If there are any new instances, creates a traversal to add the instances to a new gen.
   */
  const processRetrievedTraversal = useCallback(
    (results) => {
      /*
       * If this is a traversal from an Explore, the traversal results should have been formatted by the VS
       * into the form needed by Glove.
       * This means that it should have:
       *   a map of nodeGUID       --> { nodeGUID, label, gen }
       *   a map of lineGUID --> { lineGUID, end1GUID, end2GUID, idx, label, gen }
       *
       * Alternatively this could be a traversal object resulting from a search and subsequent user
       * selection of search results.
       *
       * For each node and line in the traversal response we need to determine whether it
       * is known or new. Anything known is dropped from the traversal, which is then pushed to the
       * logically next gen, setting the gen in each digest accordingly.
       */

      /* Assume initially that the traversal contains new information; if so it will be added to
       * the next gen, calculated below. If nothing new is learned from the traversal then we
       * will not update the current gen.
       *
       * Notice that the currentGen is NOT advanced at this stage - this will only happen if the
       * traversal contains new metadata objects.
       */
      let traversal = {};
      let nodeDigests = [];
      let lineDigests = [];
      for (const nodeGUID in results.nodes) {
        const node = results.nodes[nodeGUID];
        let nodeDigest = {};
        nodeDigest.nodeGUID = nodeGUID;
        nodeDigest.nodeType = node.nodeType;
        nodeDigest.gen = 0;
        nodeDigest.name = node.name;
        nodeDigests[nodeGUID] = nodeDigest;
        addNewGuidToNodeType(nodeGUID, node.nodeType,"processRetrievedTraversal node");
      }

      for (const lineGUID in results.lines) {
        const line = results.lines[lineGUID];
        let lineDigest = {};
        lineDigest.lineGUID = lineGUID;
        lineDigest.gen = 0;
        lineDigest.label = line.lineType;
        lineDigest.end1GUID = line.end1.nodeGuid;
        lineDigest.end2GUID = line.end2.nodeGuid;
        lineDigest.end1Node = line.end1.nodetype;
        lineDigest.end2Node = line.end2.nodetype;
        lineDigests[lineGUID] = lineDigest;
        addNewGuidToNodeType(line.end1.nodeGuid, line.end1.nodetype,"processRetrievedTraversal end1");
        addNewGuidToNodeType(line.end2.nodeGuid, line.end2.nodetype,"processRetrievedTraversal end2");
        addNewGuidToLineType(lineGUID, line.lineType);
      }
      traversal.nodes = nodeDigests;
      traversal.lines = lineDigests;

      const genId = getLatestActiveGenId() + 1;

      /*
       * Process nodes...
       * Anything that is known should be removed from the traversal.
       * Anything new can remain and should be assigned the next gen.
       */
      const nodes = traversal.nodes;
      if (nodes) {
        const eKeys = Object.keys(nodes);

        eKeys.forEach((eKey) => {
          const nodeGUID = eKey;

          /*
           * Determine whether node is already known ...
           */
          let nodeKnown = false;
          if (guidToGenId[nodeGUID] !== undefined) {
            nodeKnown = true;
          }
          if (nodeKnown === true) {
            /*
             * Remove the node from the traversal
             */
            delete traversal.nodes[nodeGUID];
          } else {
            /*
             * Update the new node's gen
             */
            traversal.nodes[nodeGUID].gen = genId;
          }
        });
      }

      /*
       * Process lines...
       * These are in a map of RexExpandedLine objects, inside of
       * which are the RexLineDigest objects.
       * Anything that is known should be removed from the traversal.
       * Anything new can remain and should be assigned the next gen.
       */
      const lines = traversal.lines;
      if (lines) {
        const rKeys = Object.keys(lines);

        rKeys.forEach((lKey) => {
          const lineGUID = lKey;

          /*
           * Determine whether line is already known ...
           */
          let lineKnown = false;
          if (guidToGenId[lineGUID] !== undefined) {
            lineKnown = true;
          }
          if (lineKnown === true) {
            /*
             * Remove the line from the traversal
             */
            delete traversal.lines[lineGUID];
          } else {
            /*
             * line is new.
             * Update the new line's gen
             */
            traversal.lines[lineGUID].gen = genId;
          }
        });
      }

      /*
       * If there is anything new still in the traversal,
       *   -  each new instance has been assigned (above) the next gen; advance the value of currentGen.
       *   -  push the traversal into the appropriate position in gens
       *   -  generate a graph-changed event
       * else
       *   -  display a message saying that nothing new was learned.
       */
      const no_nodes =
        traversal.nodes === undefined ||
        Object.keys(traversal.nodes).length === 0;
      const no_lines =
        traversal.lines === undefined ||
        Object.keys(traversal.lines).length === 0;

      if (no_nodes && no_lines) {
        /*
         * This is not an error - it just means everything in the traversal was already known,
         * which can happen.
         * However, it is desirable to advise the user that nothing new was returned, which should explain why
         * there will be no visible change to the display.
         */
        alert("No additional objects were returned in the traversal");
      } else {
        /*
         * For what it's worth - set the gen at the traversal level (the contained objects already have
         * gen set)
         */
        traversal.gen = genId;

        /*
         * Add the traversal to the sequence of gens in the graph. Then generate the graph-changed event.
         */
        addGen(traversal);
      }
    },
    [addGen, getLatestActiveGenId, guidToGenId]
  );

  /*
   * Function to get Node by GUID from the specified repository server
   */
  const loadNode = (nodeGUID, nodeTypeKey) => {
    console.log("loadNode");
    if (nodeTypeKey === undefined) {
       nodeTypeKey = guidToNodeType[nodeGUID];
    }
    if (nodeTypeKey === undefined) {
      alert("No nodetype!!! ");
    } else {
      nodeTypeKey = nodeTypeKey.toLowerCase();
      const nodeType = getNodeType(
        identificationContext.getRestURL("glossary-author"),
        nodeTypeKey
      );

      const url = nodeType.url + "/" + nodeGUID;

      if (!guidToNodeType[nodeGUID]) {
        addNewGuidToNodeType(nodeGUID, nodeType.key, "loadNode");
      }

      issueRestGet(url, onSuccessfulLoadNode, onErrorLoadNode);
    }
  };
  /*
   * Callback for completion of loadNode
   */
  const onSuccessfulLoadNode = (json) => {
    console.log("onSuccessful Load Node");
    let node = undefined;
    if (json.result.length === 1) {
      node = json.result[0];
      console.log("Node Loaded " + node.name);
    }
    if (node) {
      processRetrievedNode(node);
      return;
    } else {
      onErrorLoadNode("Error did not get a node from the server");
    }
  };

  const onErrorLoadNode = (message) => {
    reportFailedOperation("Get Node", message);
  };

  /*
   * Callback for completion of loadLine
   */
  // const _loadLine = useCallback(
  //   (json) => {
  //     if (json !== null) {
  //       if (json.relatedHTTPCode === 200) {
  //         /*
  //          * Should have an expandedLine, if the Line was not found the response
  //          * will have included a non 200 status code and a LineNotKnownException
  //          */
  //         let expLine = json.expandedLine;
  //         if (expLine !== null) {
  //           processRetrievedLine(expLine);
  //           return;
  //         }
  //       }
  //     }
  //     /*
  //      * On failure ...
  //      */
  //     reportFailedOperation("Get Line", json);
  //   },
  //   [processRetrievedLine, reportFailedOperation]
  // );

  /*
   * Function to get Line by GUID from the specified repository server
   */
  // const loadLine = (lineGUID) => {
  //   // repositoryServerContext.callPOST(
  //   //                                  "instances/line",
  //   //                                  { lineGUID : lineGUID },
  //   //                                  _loadLine);
  // };
  const loadLine = (lineGUID, lineTypeKey) => {
    console.log("loadLine");
    if (lineTypeKey === undefined) {
      lineTypeKey = guidToLineType[lineGUID];
    }
    if (lineTypeKey === undefined) {
      alert("No line type!!! ");
    } else {
      lineTypeKey = lineTypeKey.toLowerCase();
      const lineType = getLineType(
        identificationContext.getRestURL("glossary-author"),
        lineTypeKey
      );

      const url = lineType.url + "/" + lineGUID;

      if (!guidToLineType[lineGUID]) {
        addNewGuidToLineType(lineGUID, lineType, "loadLine");
      }

      issueRestGet(url, onSuccessfulLoadLine, onErrorLoadLine);
    }
  };

  /*
   * Callback for completion of loadNode
   */
  const onSuccessfulLoadLine = (json) => {
    console.log("onSuccessful Load Line");
    let line = undefined;
    if (json.result.length === 1) {
      line = json.result[0];
      console.log("Line Loaded " + line.name);
    }
    if (line) {
      processRetrievedLine(line);
      return;
    } else {
      onErrorLoadLine("Error did not get a node from the server");
    }
  };

  const onErrorLoadLine = (message) => {
    reportFailedOperation("Get Line", message);
  };

  /*
   * Function to get Line by GUID from the repository
   */
  // const loadLine = useCallback(
  //   (lineGUID) => {

  //     repositoryServerContext.repositoryPOST("instances/line",
  //                                            { lineGUID : lineGUID },
  //                                            _loadLine);
  //   },
  //   [_loadLine, repositoryServerContext]
  // );

  /*
   * clearFocusInstance resets the category, instance, guid for the focus instance
   * to a state in which nothing is selected - there is no focus.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const clearFocusInstance = useCallback(() => {
    const newFocus = {
      instanceCategory: "Node",
      instanceGUID: "",
      instance: null,
    };
    setFocus(newFocus);
  }, [setFocus]);

  /*
   * A component has requested that the focus is changed to the Node with the specified GUID.
   */
  const changeFocusNode = useCallback(
    (nodeGUID) => {
      /*
       * If the Node is the current focus - deselect it.
       */

      if (nodeGUID === focus.instanceGUID) {
        clearFocusInstance();
      } else {
        if (guidToGenId[nodeGUID] !== undefined) {
          // const genId = guidToGenId[nodeGUID];
          // const gen = gens[genId - 1];
          loadNode(nodeGUID);
        }
      }
    },
    [focus, guidToGenId, gens, clearFocusInstance, loadNode]
  );

  /*
   * A component has requested that the focus is changed to the Line with the specified GUID.
   */
  const changeFocusLine = useCallback(
    (lineGUID) => {
      /*
       * If the line is the current focus - deselect it.
       */

      if (lineGUID === focus.instanceGUID) {
        clearFocusInstance();
      } else {
        /*
         * The line was retrieved from the server identified by serverName in the gen.
         */
        if (guidToGenId[lineGUID] !== undefined) {
          // const genId = guidToGenId[lineGUID];
          // const gen = gens[genId - 1];

          loadLine(lineGUID);
        }
      }
    },
    [clearFocusInstance, focus.instanceGUID, gens, guidToGenId, loadLine]
  );

  /*
   * Helper function to retrieve focus Node
   */
  const getFocusCategory = useCallback(() => {
    if (
      focus.instanceCategory === "Node" ||
      focus.instanceCategory === "Line"
    ) {
      return focus.instanceCategory;
    }
    return null;
  }, [focus.instanceCategory]);

  /*
   * Helper function to retrieve focus Node
   */
  const getFocusNode = useCallback(() => {
    if (focus.instanceCategory === "Node") {
      if (focus.instance !== null) {
        return focus.instance;
      }
    }
    return null;
  }, [focus.instance, focus.instanceCategory]);

  /*
   * Helper function to retrieve focus Node
   */
  const getFocusLine = useCallback(() => {
    if (focus.instanceCategory === "Line") {
      if (focus.instance !== null) {
        return focus.instance;
      }
    }
    return null;
  }, [focus.instance, focus.instanceCategory]);

  const onSuccessfulExplore = (json) => {
    /*
     * Should have a traversal object
     */
    console.log("json with traversal " + JSON.stringify(json));
    let traversal = json.result[0];
    console.log("traversal " + JSON.stringify(traversal));
    if (traversal !== null) {
      traversal.operation = "traversal";
      processRetrievedTraversal(traversal);
      return;
    }
  };
  const onErrorExplore = (message) => {
    reportFailedOperation("Explore", message);
  };

  /*
   * Function to explore the neighborhood around the current focus node
   * Parmeters: list of typeNames for each of te three categories.
   */
  const explore = (nodeGUID, nodeFilter, lineFilter) => {
    let url =
      identificationContext.getRestURL("glossary-author") +
      "/graph/" +
      nodeGUID +
      "?depth=1";
    let nodeQueryParam = undefined;
    if (nodeFilter && nodeFilter.length > 0) {
      let nodeFilterStr = "";
      for (var i = 0; i < nodeFilter.length; i++) {
        nodeFilterStr = nodeFilterStr + nodeFilter[i] + ",";
      }
      // remove the last character
      nodeFilterStr = nodeFilterStr.slice(0, -1);
      nodeQueryParam = "nodeFilter=" + nodeFilterStr;
    }
    let lineQueryParam = undefined;
    if (lineFilter && lineFilter.length > 0) {
      let lineFilterStr = "";
      for (var i = 0; i < lineFilter.length; i++) {
        lineFilterStr = lineFilterStr + lineFilter[i] + ",";
      }
      // remove the last character
      lineFilterStr = lineFilterStr.slice(0, -1);
      lineQueryParam = "lineFilter=" + lineFilterStr;
    }

    if (nodeQueryParam) {
      url = url + "," + nodeQueryParam;
    }
    if (lineQueryParam) {
      url = url + "," + lineQueryParam;
    }
    // encode it
    url = encodeURI(url);
    // issue call
    issueRestGet(url, onSuccessfulExplore, onErrorExplore);
  };

  /*
   * Remove a generation from the graph
   */
  const removeGen = useCallback(() => {
    /*
     * Remove the most recent gen from the active gens. This should be noticed by the DiagramManager
     * which will update the diagram data, and callback to the removeGenComplete callback.
     */

    /*
     *  Check there is at least two gens.
     */
    if (gens.length <= 1) {
      return;
    }

    /*
     * If the gen to be popped contains the focus instance, clear the focus.
     */
    let focusGenId = guidToGenId[focus.instanceGUID];
    if (focusGenId === gens.length) {
      clearFocusInstance();
    }

    /*
     * Do not mutate the current array - replace for state update to register
     */
    let newList = Object.assign([], gens);
    const removedGen = newList.pop();

    setGens(newList);
    setLatestActiveGenId(newList.length);

    /*
     * Look for instances that were added in the removedGen, and remove then from the guidToGenId map.
     * Because the map is immutable, corral the changes in a cloned map and apply them in one replace operation
     */

    let newGUIDMap = Object.assign({}, guidToGenId);
    const eKeys = Object.keys(removedGen.nodes);
    eKeys.forEach((e) => {
      delete newGUIDMap[e];
    });
    const rKeys = Object.keys(removedGen.lines);
    rKeys.forEach((r) => {
      delete newGUIDMap[r];
    });
    /*
     * Now replace the map...
     */
    setGuidToGenId(newGUIDMap);
    if (newGUIDMap.length === 1) {
      // if there is one node - then we need to reload it to populate the details and to give it focus.
      for (let nodeGUID in newGUIDMap) {
        loadNode(nodeGUID);
      }
    
    }
  }, [clearFocusInstance, focus.instanceGUID, gens, guidToGenId]);

  /*
   * Clear the state of the session - this includes the gens, the focus and the guidToGenId map.
   * Reset the searchCategory to Node and the CategoryToLoad to Node.
   */
  const clear = useCallback(() => {
    /*
     * Reset the focusInstance
     */
    clearFocusInstance();
    const firstGen = Object.assign({}, gens[0]);
    // firstGen should have the original node in it.
    const originalNode = firstGen.nodes[0];

    /*
     * Empty the graph
     */
    const emptyArray = [];
    setGens(emptyArray);
    setLatestActiveGenId(0);

    /*
     * Empty the map
     */
    const emptymap = {};
    setGuidToGenId(emptymap);
    loadNode(originalNode.nodeGUID, originalNode.nodeType);
  }, [clearFocusInstance]);

  /*
   * getHistory compiles a history list describing the exploration from gen 1 onwards.
   */
  const getHistory = useCallback(() => {
    let historyList = [];

    /*
     * Each gen consists of the following:
     *
     *   private String               nodeGUID;                 -- must be non-null
     *   private String               nodeTypeName              -- must be non-null
     *   private List<String>         nodeTypeNames;            -- a list of type names or null
     *   private List<String>         lineTypeNames;            -- a list of type names or null
     *   private Integer              depth;                    -- the depth used to create the subgraph
     *   private Integer              gen;                      -- which generation this subgraph pertains to
     *
     *   There are also fields that contain maps of instance summaries.
     *   An instance summary is much smaller than the full instance.
     *   The nodes map is keyed by nodeGUID and the value part consists of
     *       { nodeGUID, label, gen }
     *   The lines map is keyed by lineGUID and the value part consists of
     *       { lineGUID, end1GUID, end2GUID, idx, label, gen }
     *   The above value types are described by the RexNodeDigest and RexLineDigest Java classes.
     *   private Map<String,RexNodeDigest>         nodes;
     *   private Map<String,RexLineDigest>   lines;
     *
     *   The traversal is augmented in the client by the addition of an operation field. This is only meaningful in the
     *   client code.
     *   private String                operation  - has values { 'getNode' | 'getLine' | 'traversal' }
     */

    for (let i = 0; i < gens.length; i++) {
      const gen = i + 1;
      const genContent = gens[i];

      /*
       *  Build the query description
       */

      /*
       * The querySummary always starts with the Repository Server's name
       */

      const serverName = genContent.serverName;
      let querySummary = "[" + serverName + "]";

      switch (genContent.operation) {
        case "getNode":
          /*
           * Format querySummary as "Node retrieval \n GUID: <guid>"
           */
          querySummary = querySummary.concat(" Node retrieval using GUID");
          break;

        case "getLine":
          /*
           * Format querySummary as "Line retrieval \n GUID: <guid>"
           */
          querySummary = querySummary.concat(" Line retrieval using GUID");
          break;

        case "traversal":
          /*
           * Format querySummary as "Traversal"
           * Would like to present user with label rather than guid. genContent.root contains GUID.
           * The reason for the lookup is that the root of the traversal will not be in the same gen
           * as the traversal results. It is not known which gen it is (except it must have existed prior
           * to traversal).
           */
          {
            const nodeGUID = genContent.nodeGUID;
            const rootGenNumber = guidToGenId[nodeGUID];
            const rootGen = gens[rootGenNumber - 1];
            const rootDigest = rootGen.nodes[nodeGUID];
            const rootLabel = rootDigest.label;
            querySummary = querySummary.concat(
              " Traversal from Node " + rootLabel
            );
            querySummary = querySummary.concat(" Depth: " + genContent.depth);

            /*
             * Node Type Filters - show type names rather than type GUIDs
             */
            querySummary = querySummary.concat(" Node Type Filters: ");
            var nodeTypeNames = genContent.NodeTypeNames;
            if (nodeTypeNames !== undefined && nodeTypeNames !== null) {
              let first = true;
              nodeTypeNames.forEach(function (etn) {
                if (first) {
                  first = false;
                  querySummary = querySummary.concat(etn);
                } else {
                  querySummary = querySummary.concat(", " + etn);
                }
              });
            } else querySummary = querySummary.concat("none");
          }

          /*
           * Line Type Filters - show type names rather than type GUIDs
           */
          querySummary = querySummary.concat(" Line Type Filters: ");
          var lineTypeNames = genContent.LineTypeNames;
          if (lineTypeNames !== undefined && lineTypeNames !== null) {
            let first = true;
            lineTypeNames.forEach(function (rtn) {
              if (first) {
                first = false;
                querySummary = querySummary.concat(rtn);
              } else {
                querySummary = querySummary.concat(", " + rtn);
              }
            });
          } else querySummary = querySummary.concat("none");

          break;

        case "NodeSearch":
          /*
           * Format querySummary as "Node Search Expression [<expr>] <guid>"
           */
          querySummary = querySummary.concat(" Node Search: ");
          querySummary = querySummary.concat(
            " Expression [" + genContent.searchText + "]"
          );
          break;

        case "lineSearch":
          /*
           * Format querySummary as "Line Search Expression [<expr>] <guid>"
           */
          querySummary = querySummary.concat(" Line Search: ");
          querySummary = querySummary.concat(
            " Expression [" + genContent.searchText + "]"
          );
          break;

        default:
          /*
           *  Found a gen result with no operation type.
           *  Add error message to gen so this is noticed in history....
           */
          querySummary = "Operation not recognised!";
          break;
      }

      /*
       *  Build the instances section
       */
      const instanceList = [];
      const nodes = genContent.nodes;
      for (let guid in nodes) {
        const ent = nodes[guid];
        instanceList.push({
          category: "Node",
          label: ent.label,
          guid: ent.nodeGUID,
        });
      }

      const lines = genContent.lines;
      for (let guid in lines) {
        const rel = lines[guid];
        instanceList.push({
          category: "Line",
          label: rel.label,
          guid: rel.lineGUID,
        });
      }
      var historyItem = {
        gen: gen,
        query: querySummary,
        instances: instanceList,
      };

      historyList.push(historyItem);
    }

    return historyList;
  }, [gens, guidToGenId]);

  return (
    <InstancesContext.Provider
      value={{
        gens,
        guidToGenId,
        focus,
        latestActiveGenId,
        setGuidToGenId,
        setFocus,
        getFocusGUID,
        getFocusGen,
        getFocusGenId,
        setFocusNode,
        getFocusNode,
        changeFocusNode,
        getFocusLine,
        setFocusLine,
        changeFocusLine,
        getFocusCategory,
        clearFocusInstance,
        clear,
        getHistory,
        loadNode,
        loadLine,
        processRetrievedTraversal,
        explore,
        setGens,
        getLatestActiveGenId,
        removeGen,
        getLatestGen,
      }}
    >
      {props.children}
    </InstancesContext.Provider>
  );
};

InstancesContextProvider.propTypes = {
  children: PropTypes.node,
};

export default InstancesContextProvider;
