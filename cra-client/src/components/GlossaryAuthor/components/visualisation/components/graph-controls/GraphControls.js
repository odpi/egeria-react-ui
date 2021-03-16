/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState, useRef }   from "react";

import PropTypes                                 from "prop-types";

import { IdentificationContext }                    from "../../../../../../contexts/IdentificationContext";

import { InstancesContext }                      from "../../contexts/InstancesContext";

import { InteractionContext }                    from "../../contexts/InteractionContext";

import TraversalResultHandler                    from "./TraversalResultHandler";

import HistoryResultHandler                      from "./HistoryResultHandler";

import "../../glove.scss";
import { issueRestGet } from "../../../RestCaller";


export default function GraphControls(props) {

  const identificationContext = useContext(IdentificationContext);
  const instancesContext        = useContext(InstancesContext);

  const interactionContext      = useContext(InteractionContext);

  
  /*
   * status records the state of the current traversal request (if any) for cancellation
   * There is also a useRef for current state so that the callbacks from the POSTs can
   * read the **current** version of state, which may have changed since the callback 
   * was registered (i.e. on the POST call). In the event of a cancel, status should 
   * have changed to 'cancelled' and we need the callback to see the change.
   *
   * status : { "idle", "pending", "cancelled:", "complete" }
   */
  const [status, setStatus]            = useState("idle");
  const statusRef                      = useRef();
  statusRef.current                    = status;

  /*
   * histStatus : { "idle", "pending", "cancelled:", "complete" }
   */
  const [histStatus, setHistStatus]    = useState("idle");
  const histStatusRef                  = useRef();
  histStatusRef.current                = histStatus;

  const [history, setHistory]          = useState([]); 

  const [preTraversalNodeTypes, setPreTraversalNodeTypes]       = useState([]); 
  const [preTraversalLineTypes, setPreTraversalLineTypes]       = useState([]); 

  /*
   * Handler for Explore button - initiate a pre-traversal
   * Function to explore the neighborhood around the current focus node
   */
  const preTraversal = () => {

    setStatus("pending");

    const focusCat = instancesContext.getFocusCategory();

    if (focusCat !== "Node") {
      alert("Please select a node from which to explore...");
      return;
    }

    const nodeGUID = instancesContext.getFocusGUID();

    if (nodeGUID === "") {
      alert("Please select a node from which to explore...");
      return;
    }

    const preTraversalURL = identificationContext.getRestURL("glossary-author")+ "/graph-counts/" + nodeGUID;
    /*
     * No filtering is applied to the pre-traversal...
     */
     issueRestGet(preTraversalURL, onSuccessfulPreTraversal, onErrorPreTraversal);
  }


  /*
   * Handle completion of explore
   */
  const onSuccessfulPreTraversal = (json) => {  

    if (statusRef.current !== "cancelled" && statusRef.current !== "complete") {

          /*
           * Should have a traversal object        
           */
          let glovePreTraversal = json.result;
          if (glovePreTraversal  !== null) {
            processPreTraversalResponse(glovePreTraversal);
          }
          setStatus("complete");
          return;
    }
    else {
      setStatus("idle");
    }
  };
  const onErrorPreTraversal = (message) => {
    setStatus("cancelled");
    interactionContext.reportFailedOperation("prepare for traversal", message);
  }  
 
  const processPreTraversalResponse = (glovePreTraversal) => {
    /*
     * Display traversal filters. On the submit handler launch the real (filtered) traversal
     * and push the result up to the InstancesContext.
     *
     * Unpack the glovePreTraversal fields
     *    private String                      nodeGUID;                    --  must be non-null
     *    private Map<String, NodeLineStats>  nodeInstanceCounts;          --  the keys are NodeType names. The map can be null meaning no filtering by NodeType
     *    private Map<String, NodeLineStats>  lineInstanceCounts;          --  the keys are LineType names.  The map can be null meaning no filtering by LineType
     *    private Integer                     depth;
     */
    let localPreTraversalResults = {};
   
    /*
     * Process the node instance stats...
     */
    localPreTraversalResults.nodeTypes = [];
    const nodeCounts = glovePreTraversal[0].nodeCounts;
    if (nodeCounts != null) {
      const typeNames = Object.keys(nodeCounts);
      typeNames.forEach(typeName => {
        const count = nodeCounts[typeName].count;
        /*
         * Stash the typeName and count in this.preTraversal for later access
         */
        localPreTraversalResults.nodeTypes.push( { 'name' : typeName  , 'count' : count , 'checked' : false });
      });
      localPreTraversalResults.nodeTypes.sort((a, b) => (a.name > b.name) ? 1 : -1);
    }

    /*
     * Process the line instance stats...
     */
    localPreTraversalResults.lineTypes = [];
    const lineCounts = glovePreTraversal[0].lineCounts;
    if (lineCounts != null) {
      const typeNames = Object.keys(lineCounts);
      typeNames.forEach(typeName => {
        const count = lineCounts[typeName].count;
        /*
         * Stash the typeName and count in this.preTraversal for later access
         */
        localPreTraversalResults.lineTypes.push( { 'name' : typeName, 'count' : count , 'checked' : false });
      });
      localPreTraversalResults.lineTypes.sort((a, b) => (a.name > b.name) ? 1 : -1);
    }

    setPreTraversalNodeTypes(localPreTraversalResults.nodeTypes);
    setPreTraversalLineTypes(localPreTraversalResults.lineTypes);

  };

  /*
   * Handler for submit of traversal results modal
   */
  const submitTraversalModal = (evt) => {

    /*     
     * Invoke the InstancesComtext explore operation - passing it the filters which 
     * for entities and lines are converted to typeGUIDs. Classifcations are 
     * passed as a list of names, so don't need conversion but we just want the 'name'.
     * The explore will perform the full traversal and processes the retrieved instance graph.
     */

    let selectedNodeTypeNames = [];
    preTraversalNodeTypes.forEach( (type) => {
      if (type.checked) {
        selectedNodeTypeNames.push(type.name);
      }
    });

    let selectedLineTypeNames = [];
    preTraversalLineTypes.forEach(type=> {
      if (type.checked) {
        selectedLineTypeNames.push(type.name);
      }
    });

    instancesContext.explore( instancesContext.getFocusGUID(), selectedNodeTypeNames, selectedLineTypeNames);

    /*
     * Clear the traversal results
     */
    setPreTraversalNodeTypes([]);
    setPreTraversalLineTypes([]);

    /* 
     * Hide the traversal dialog
     */
    setStatus("idle");
  }

  /*
   * Handler for cancel of traversal results modal.
   * The modal is hidden but is not cleared - so if needed it can be re-displayed and the results
   * of the previous traversal will still be available.
   */
  const cancelTraversalModal = (evt) => {

    if (status === "cancelled") {
      setStatus("idle");
    }
    else if (status === "complete") {
      setStatus("idle");
    }
    else {
      setStatus("cancelled");
    }
  }


  /*
   * Handler for updating traversal results when user checks or unchecks a type in the traversal results
   */
  const selectCallback = (category, name) => {

    if (category === "Node") {
      let updates = [];
      preTraversalNodeTypes.forEach((type) => {
        let newtype = type;
        if (type.name === name) {
          newtype.checked = !(type.checked);
        }
        updates.push( newtype );
      });
      /*
       * Reflect the change in checked state in the pre-traversal list
       */
      setPreTraversalNodeTypes(updates);
    }

    if (category === "Line") {
      let updates = [];
      preTraversalLineTypes.forEach((type) => {
        let newtype = type;
        if (type.name === name) {
          newtype.checked = !(type.checked);
        }   
        updates.push( newtype );       
      });
      /*
       * Reflect the change in checked state in the pre-traversal list
       */
      setPreTraversalLineTypes( updates );
    } 

  }


  const setAllCallback = (checked) => {

    /*
     * Set all Node types to checked...
     */
    let updates = [];
    preTraversalNodeTypes.forEach((type) => {
      let newtype = Object.assign(type, {checked : checked});
      updates.push( newtype );
    });
    setPreTraversalNodeTypes(updates);

    /*
     * Set all line types to checked...
     */
    updates = [];
    preTraversalLineTypes.forEach((type) => {
      let newtype = Object.assign(type, {checked : checked});
      updates.push( newtype );
    });
    setPreTraversalLineTypes(updates);

  }

  const getHistory = () => {
    setHistory(instancesContext.getHistory());
    setHistStatus("complete");
  };

  const cancelHistoryModal = () => {
    setHistStatus("idle");
  };

  const submitHistoryModal = () => {
    setHistStatus("idle");
  };
  
  return (
    
    <div className={props.className}>
        <p className="descriptive-text">
          Traversal count : {instancesContext.getLatestActiveGenId()}
        </p>
        <button className="graph-control-button"
          onClick = { () => preTraversal() }  >
          Explore
        </button>
        <button className="graph-control-button"
          onClick = { () => instancesContext.removeGen() }  >
          Undo
        </button>
        <button className="graph-control-button"
          onClick = { () => instancesContext.clear() }  >
          Clear
        </button>
        <button className="graph-control-button" 
          onClick = { () => getHistory() }  >
          History
        </button>

        <TraversalResultHandler status                = { status }
                                //spec                  = { traversalSpecification }
                                selectCallback        = { selectCallback }
                                setAllCallback        = { setAllCallback }
                                nodeTypes             = {preTraversalNodeTypes}
                                lineTypes             = {preTraversalLineTypes}
                                onCancel              = { cancelTraversalModal }
                                onSubmit              = { submitTraversalModal } />

        <HistoryResultHandler   status                = { histStatus }
                                history               = { history }
                                onCancel              = { cancelHistoryModal }
                                onSubmit              = { submitHistoryModal } />

    </div>

  );

}

GraphControls.propTypes = {  
  className  : PropTypes.string
}

