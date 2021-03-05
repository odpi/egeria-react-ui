/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */


import React, { createContext, useState, useCallback } from "react";

import PropTypes                                      from "prop-types";
import { issueRestGet } from "../../RestCaller";

/*
 * The InstancesContext holds the state for the instances that are retrieved from the 
 * repository and loaded into the graph. It also holds transient state that exists
 * following the completion of a search and the selection by the user of which searched
 * instances they want to add to the graph.
 * 
 */
export const InstancesContext         = createContext();

export const InstancesContextConsumer = InstancesContext.Consumer;

const InstancesContextProvider = (props) => {

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
  const [focus, setFocus] = useState({ instanceCategory : "", 
                                       instanceGUID     : "",
                                       instance         : null });


   /*
   * setFocusEntity sets the category, instance, guid for the focus instance.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const setFocusEntity = useCallback(
    (expEntity) => {

    const newFocus = { instanceCategory : "Entity",
                       instanceGUID : expEntity.entityDetail.guid,
                       instance : expEntity };
    setFocus( newFocus );
  },
  []
  );

  /*
   * setFocusLine sets the category, instance, guid for the focus instance.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const setFocusLine = useCallback(
    (expLine) => {

    const newFocus = { instanceCategory : "Line",
                       instanceGUID     : expLine.line.guid,
                       instance         : expLine };
    setFocus( newFocus );
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
  const [gens,         setGens]           = useState([]); 
  const [guidToGenId , setGuidToGenId]    = useState({}); 

  /* 
   * The latestGenId is not just the length of the gens array - it indicates the id of the most recent
   * active generation. When the array is growing it will always be the last gen in the array. But when 
   * undo or clear is used, it will be either one less than the array length, or even zero (on clear).
   */
  const [latestActiveGenId,  setLatestActiveGenId]    = useState(0);

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
  const getLatestGen = 
    () => {
    return gens[gens.length-1];
  }
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
  const reportFailedOperation = useCallback(
    (operation, message) => {
      alert("Attempt to "+operation+" and got error: " + message);
  },
  []
  );


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
    setGens( newList );   
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
    let newEntries = Object.assign({},guidToGenId);
    const eKeys = Object.keys(traversal.nodes);
    eKeys.forEach(e => {     
      newEntries[e] = newGen;
    });
    const rKeys = Object.keys(traversal.lines);
    rKeys.forEach(r => {
      newEntries[r] = newGen;
    });
    /*
     * Now replace the map...
     */
    setGuidToGenId(newEntries);
  
  },
  [gens,setGens,guidToGenId,setGuidToGenId,setLatestActiveGenId ]
  );

  /*
   * setFocusNode sets the category, instance, guid for the focus instance.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const setFocusNode = useCallback(
    (node) => {

    const newFocus = { instanceCategory : "Node",
                       instanceGUID : node.systemsAttributes.guid,
                       instance : node };
    setFocus( newFocus );
  },
  []
  );


  /*
   * Get the GUID of the focus instance
   */
  const getFocusGUID = useCallback(
    () => {
    return focus.instanceGUID;
  },
  [focus]
  );

  /*
   * Get the gen containing the focus instance
   */
  const getFocusGen = useCallback(
    () => {
    let focusGenId = guidToGenId[focus.instanceGUID];
    let focusGen = gens[focusGenId - 1];
    return focusGen;
  },
  [guidToGenId, gens, focus.instanceGUID]
  );

  /*
   * Get the id of the gen containing the focus instance
   */
  const getFocusGenId = useCallback(
    () => {
    let focusGenId = guidToGenId[focus.instanceGUID];
    return focusGenId;
  },
  [guidToGenId, focus]
  );

  /*
   * Functions to process retrieved instances
   */

  /*
   * processRetrievedNode accepts an node, checks whether it is already known and if not,
   * creates a traversal to add the Node to a new gen
   */
  const processRetrievedNode = 
    (node) => {

    const nodeGUID = node.systemAttributes.guid;

    let genId;
    if (guidToGenId[nodeGUID] !== undefined) {
      /*
       * Node is already known
       */
      genId = guidToGenId[nodeGUID];
      node.gen = genId;


    }
    else {
      /*
       * Node is not already known
       *
       * Construct a traversal for the Node and add it to the gens.
       * The genId is in the digest and will be one beyond the current latest gen
       */  
      genId = getLatestActiveGenId() + 1;
      node.gen = genId;

      let traversal             = {};
      traversal.nodes           = {};
      traversal.lines           = {};
      traversal.nodes[nodeGUID] = node;
     
      traversal.operation       = "getNode";

      /*
       * Add the traversal to the sequence of gens in the graph.
       */
      addGen(traversal);
    }
    
    /*
     * Because this is processing the retrieval of a single node, that node becomes the focus
     */
    setFocusNode(node);

  }

  /*
   * processRetrievedLine accepts an expLine, checks whether it is already known and if not,
   * creates a traversal to add the Line to a new gen
   */
  const processRetrievedLine = useCallback(
    (expLine) => {

    const lineGUID = expLine.systemAttributes.guid;

    let genId;
    if (guidToGenId[lineGUID] !== undefined) {
      /*
       * Line is already known
       */
      genId = guidToGenId[lineGUID];
      expLine.gen = genId;
    }
    else {
      /* 
       * Line is not already known
       *
       * Construct a traversal for the Line and add it to the gens.
       * The genId is in the digest and will be one beyond the current latest gen
       */
      genId = getLatestActiveGenId() + 1;
      expLine.gen = genId;

      let traversal                              = {};
      traversal.nodes                            = {};
      traversal.lines                            = {};
      traversal.lines[lineGUID]                  = expLine.LineDigest;
      traversal.operation                        = "getLine";


      /*
       * We need to retrieve the end node digests from the expLine and find out
       * whether each end node is new or known, so they can either keep their gens or be
       * assigned the next gen...
       */

      /*
       * nodeOne
       */
      const nodeOneDigest = expLine.nodeOneDigest;
      const nodeOneGUID = nodeOneDigest.nodeGUID;

      /*
       * Determine whether nodeOne is already known. This could loop through the gens
       * but it is slightly more efficient to use the guidToGen map as a direct index.
       */
      let nodeOneKnown = false;
      let e1gen;
      if (guidToGenId[nodeOneGUID] !== undefined) {
          nodeOneKnown = true;
          e1gen          = guidToGenId[nodeOneGUID];
      }
      if (nodeOneKnown === false) {
          e1gen = genId;
      }
      nodeOneDigest.gen = e1gen;

      /*
       * nodeTwo
       */
      const nodeTwoDigest = expLine.nodeTwoDigest;
      const nodeTwoGUID   = nodeTwoDigest.nodeGUID;

      /*
       * Determine whether nodeTwo is already known. This could loop through the gens
       * but it is slightly more efficient to use the guidToGen map as a direct index.
       */
      let nodeTwoKnown = false;
      let e2gen;
      if (guidToGenId[nodeTwoGUID] !== undefined) {
          nodeTwoKnown = true;
          e2gen          = guidToGenId[nodeTwoGUID];
      }
      if (nodeTwoKnown === false) {
          e2gen = genId;
      }
      nodeTwoDigest.gen = e2gen;

      /*
       * Add the node digests to the traversal ONLY if they are new in this gen
       */
      if (!nodeOneKnown) {
        traversal.nodes[nodeOneGUID] = nodeOneDigest;
      }
      if (!nodeTwoKnown) {
        traversal.nodes[nodeTwoGUID] = nodeTwoDigest;
      }
      
      /*
       * Add the traversal to the sequence of gens in the graph.
       */
      addGen(traversal);
    }
    
    /*
     * Because this is processing the retrieval of a single Line, that Line becomes the focus
     */
    setFocusLine(expLine);
  },
  [addGen, getLatestActiveGenId, guidToGenId, setFocusLine]
  );


  /*
   * processRetrievedTraversal accepts a traversal, and parses it, checking whether each instance it contains is
   * already known. If there are any new instances, creates a traversal to add the instances to a new gen.
   */
  const processRetrievedTraversal = useCallback(
    (traversal) => {
    

      /*
       * If this is a traversal from an Explore, the traversal results should have been formatted by the VS 
       * into the form needed by Rex.
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
      
      const genId = getLatestActiveGenId() + 1;

      /*
       * Process nodes...
       * Anything that is known should be removed from the traversal.
       * Anything new can remain and should be assigned the next gen.
       */
      const nodes = traversal.nodes;
      if (nodes) {

        const eKeys = Object.keys(nodes);

        eKeys.forEach(eKey => {

          const node = nodes[eKey];
          const nodeGUID = node.nodeGUID;

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
          }
          else {
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

        rKeys.forEach(rKey => {

          const line = lines[rKey];
          const lineGUID = line.lineGUID;

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
          }
          else {
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
      const no_nodes      = traversal.nodes      === undefined || Object.keys(traversal.nodes).length      === 0;
      const no_lines = traversal.lines === undefined || Object.keys(traversal.lines).length === 0;

      if (no_nodes && no_lines) {
          /*
           * This is not an error - it just means everything in the traversal was already known,
           * which can happen.
           * However, it is desirable to advise the user that nothing new was returned, which should explain why
           * there will be no visible change to the display.
           */
          alert("No additional objects were returned in the traversal");
      }

      else {
        
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
  const loadNode =  (nodeGUID, nodeType) => {
    console.log("loadNode");
    const url = nodeType.url + "/" + nodeGUID;
    issueRestGet(url, onSuccessfulLoadNode, onErrorLoadNode);
  }
  /*
   * Callback for completion of loadNode
   */
  const onSuccessfulLoadNode = (json) => {
    console.log("onSuccessful Load Node");
    let node= undefined;
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
  // const onSuccessfulLoadNode = useCallback(

  //   (json) => {

  //     if (json !== null) {
  //       if (json.relatedHTTPCode === 200) {
  //         /*
  //          * Should have an expandedNodeDetail, if the Node was not found the response
  //          * will have included a non 200 status code and an NodeNotKnownException
  //          */
  //         let expNode = json.expandedNodeDetail;
  //         if (expNode) {
  //           processRetrievedNode(expNode);
  //           return;
  //         }
  //       }
  //     }
  //     /*
  //      * On failure ...
  //      */
  //     reportFailedOperation("get Node",json);
  //   },
  //   [ processRetrievedNode, reportFailedOperation]
  // );

  const onErrorLoadNode = (message) => {
    reportFailedOperation("Get Node", message);
  }


  /*
   * Callback for completion of loadLine
   */
  const _loadLine = useCallback(
    (json) => {

      if (json !== null) {
        if (json.relatedHTTPCode === 200) {
          /*
           * Should have an expandedLine, if the Line was not found the response
           * will have included a non 200 status code and a LineNotKnownException
           */
          let expLine = json.expandedLine;
          if (expLine !== null) {
            processRetrievedLine(expLine);
            return;
          }
        }
      }
      /*
       * On failure ...
       */
      reportFailedOperation("Get Line",json);
    },
    [ processRetrievedLine, reportFailedOperation]
  );

  /*
   * Function to get Line by GUID from the specified repository server
   */
  const loadLine = 
    (lineGUID) => {
      // repositoryServerContext.callPOST(
      //                                  "instances/line",
      //                                  { lineGUID : lineGUID },
      //                                  _loadLine);
    }

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
  const clearFocusInstance = useCallback(
    () => {
    
      const newFocus = { instanceCategory : "Node",
                         instanceGUID     : "",
                         instance         : null };
      setFocus( newFocus );
    },
    [setFocus]
  );

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
      }

      else {
        if (guidToGenId[nodeGUID] !== undefined) {
          const genId            = guidToGenId[nodeGUID];
          const gen              = gens[genId-1];
          loadNode(nodeGUID);
        }
      }
    },
    [focus, guidToGenId, gens, clearFocusInstance, loadNode ]
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
      }

      else {

        /*
         * The line was retrieved from the server identified by serverName in the gen.
         */
        if (guidToGenId[lineGUID] !== undefined) {
          const genId              = guidToGenId[lineGUID];
          const gen                = gens[genId-1];
        
          loadLine(lineGUID);
        }
      }
    },
    [clearFocusInstance, focus.instanceGUID, gens, guidToGenId, loadLine]
  );



  /*
   * Helper function to retrieve focus Node
   */
  const getFocusCategory = useCallback(
    () => {

      if (focus.instanceCategory === "Node" || focus.instanceCategory === "Line" ) {
        return focus.instanceCategory;
      }
      return null;
    },
    [focus.instanceCategory]
  );



  /*
   * Helper function to retrieve focus Node
   */
  const getFocusNode = useCallback(
    () => {

      if (focus.instanceCategory === "Node") {
        if (focus.instance !== null) {
          return focus.instance;
        }
      }
      return null;
    },
    [focus.instance, focus.instanceCategory]
  );

   /*
   * Helper function to retrieve focus Node
   */
  const getFocusLine = useCallback(
    () => {

      if (focus.instanceCategory === "Line") {
        if (focus.instance !== null) {
          return focus.instance;
        }
      }
      return null;
    },
    [focus.instance, focus.instanceCategory]
  );


  const _explore = useCallback(
    (json) => {
      if (json !== null) {
        if (json.relatedHTTPCode === 200) {
          /*
           * Should have a traversal object
           */
          let traversal = json.traversal;
          if (traversal !== null) {
            traversal.operation = "traversal";
            processRetrievedTraversal(traversal);
            return;
          }
        }
      }
      /*
       * On failure ...
       */
      reportFailedOperation("explore neighborhood around node",json);
    },
    [ processRetrievedTraversal, reportFailedOperation]
  );

  /*
   * Function to explore the neighborhood around the current focus node
   * Parmeters: list of typeNames for each of te three categories.
   */
  const explore = 
    (nodeGUID, selectedNodeTypes, selectedLineTypes ) => {
   
      // repositoryServerContext.repositoryPOST(
      //   "instances/traversal",
      //   { nodeGUID             :  getFocusGUID(),
      //     depth                :  1,                             // depth is always limited to 1
      //     nodeTypeNames        :  selectedNodeTypes,
      //     lineTypeNames        :  selectedLineTypes
      //   },
      //   _explore);
    };


  /*
   * Remove a generation from the graph
   */
  const removeGen = useCallback(
    () => {
      /*
       * Remove the most recent gen from the active gens. This should be noticed by the DiagramManager
       * which will update the diagram data, and callback to the removeGenComplete callback.
       */
    
      /*
       *  Check there is at least one gen.
       */
      if (gens.length <= 0)
      {
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
      let newList = Object.assign([],gens);
      const removedGen = newList.pop();

      setGens( newList );
      setLatestActiveGenId(newList.length);

      /*
       * Look for instances that were added in the removedGen, and remove then from the guidToGenId map.
       * Because the map is immutable, corral the changes in a cloned map and apply them in one replace operation
       */
    
      let newGUIDMap = Object.assign({},guidToGenId);
      const eKeys = Object.keys(removedGen.nodes);
      eKeys.forEach(e => {
        delete newGUIDMap[e];
      });
      const rKeys = Object.keys(removedGen.lines);
      rKeys.forEach(r => {
        delete newGUIDMap[r];
      });
      /*
       * Now replace the map...
       */
      setGuidToGenId(newGUIDMap);

    },
    [clearFocusInstance, focus.instanceGUID, gens, guidToGenId]
  );

  
 


  /*
   * Clear the state of the session - this includes the gens, the focus and the guidToGenId map.
   * Reset the searchCategory to Node and the CategoryToLoad to Node.
   */
  const clear = useCallback(
    () => {

      /*
       * Reset the focusInstance
       */
      clearFocusInstance();
    
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
    
    },
    [clearFocusInstance]
  );


  /*
   * getHistory compiles a history list describing the exploration from gen 1 onwards.
   */
  const getHistory = useCallback(
    () => {

      let historyList = [];

      /*
       * Each gen consists of the following:
       *
       *   private String               nodeGUID;                 -- must be non-null
       *   private String               nodeTypeName              -- must be non-null
       *   private List<String>         nodeTypeNames;            -- a list of type guids or null
       *   private List<String>         lineTypeNames;            -- a list of type guids or null
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

      for (let i=0; i<gens.length; i++) {
        const gen = i+1;
        const genContent = gens[i];

        /*
         *  Build the query description
         */

        /*
         * The querySummary always starts with the Repository Server's name
         */

        const serverName = genContent.serverName;
        let querySummary = "["+serverName+"]";


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
               const nodeGUID      = genContent.nodeGUID;
               const rootGenNumber = guidToGenId[nodeGUID];
               const rootGen       = gens[rootGenNumber-1];
               const rootDigest    = rootGen.nodes[nodeGUID];
               const rootLabel     = rootDigest.label;
               querySummary        = querySummary.concat(" Traversal from Node "+rootLabel);
               querySummary        = querySummary.concat(" Depth: "+genContent.depth);

              /*
               * Node Type Filters - show type names rather than type GUIDs
               */
              querySummary        = querySummary.concat(" Node Type Filters: ");
              var nodeTypeNames = genContent.NodeTypeNames;
              if (nodeTypeNames !== undefined && nodeTypeNames !== null) {
                let first = true;
                nodeTypeNames.forEach(function(etn){
                  if (first) {
                    first = false;
                    querySummary = querySummary.concat(etn);
                  }
                  else {
                    querySummary = querySummary.concat(", "+etn);
                  }
                });
              }
              else
                querySummary = querySummary.concat("none");
             }

            /*
             * Line Type Filters - show type names rather than type GUIDs
             */
            querySummary = querySummary.concat(" Line Type Filters: ");
            var lineTypeNames = genContent.LineTypeNames;
            if (lineTypeNames !== undefined && lineTypeNames !== null) {
              let first = true;
              lineTypeNames.forEach(function(rtn){
                if (first) {
                  first = false;
                  querySummary = querySummary.concat(rtn);
                }
                else {
                  querySummary = querySummary.concat(", "+rtn);
                }
              });
            }
            else
              querySummary = querySummary.concat("none");
  
            break;


          case "NodeSearch":
            /*
             * Format querySummary as "Node Search Expression [<expr>] <guid>"
             */
            querySummary = querySummary.concat(" Node Search: ");
            querySummary = querySummary.concat(" Expression ["+genContent.searchText+"]");
            break;


          case "lineSearch":
            /*
             * Format querySummary as "Line Search Expression [<expr>] <guid>"
             */
            querySummary = querySummary.concat(" Line Search: ");
            querySummary = querySummary.concat(" Expression ["+genContent.searchText+"]");
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
          instanceList.push( { "category" : "Node",
                               "label" : ent.label,
                               "guid" : ent.nodeGUID } );
        }

        const lines = genContent.lines;
        for (let guid in lines) {
          const rel = lines[guid];
          instanceList.push( { "category" : "Line",
                               "label" : rel.label,
                               "guid" : rel.lineGUID } );
        }
        var historyItem = {  "gen" : gen , "query" : querySummary , "instances" : instanceList};

        historyList.push(historyItem);
      }
    
      return historyList;

    },
    [gens, guidToGenId]
  );

 
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
        // _loadNode,
        loadLine,
        _loadLine,
        processRetrievedTraversal,
        explore,
        _explore,
        setGens,
        getLatestActiveGenId,
        removeGen,
        getLatestGen
     }}
    >      
      {props.children}
    </InstancesContext.Provider>
  );
};

InstancesContextProvider.propTypes = {
  children: PropTypes.node  
};

export default InstancesContextProvider;

