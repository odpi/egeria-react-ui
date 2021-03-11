/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */


import React, { useContext, useEffect }       from "react";

import PropTypes                              from "prop-types";

import { InteractionContext }                 from "../../contexts/InteractionContext";

import "./traversal.scss";


export default function TraversalResultHandler(props) {

  const interactionContext    = useContext(InteractionContext);

  const nodeTypes           = props.nodeTypes; 
  const lineTypes     = props.lineTypes; 
  const selectCallback        = props.selectCallback;
  const setAllCallback        = props.setAllCallback;
    

  const nodeFilterChanged = (evt) => {
    selectCallback("Node", evt.target.id);    
  }

  const lineFilterChanged = (evt) => {
    selectCallback("Line",evt.target.id);    
  }

  const checkAll = () => {    
    setAllCallback(true);
  }

  const uncheckAll = () => {    
    setAllCallback(false);
  }  

  const cancelCallback = () => {
    interactionContext.hidePortal();
    props.onCancel();
  }

  const submitCallback = () => {
    interactionContext.hidePortal();
    props.onSubmit();
  }



  const triggerPortal = () => {

    let dialogDisplay;

    if (props.status === "pending") {

      /*
       * Display in-progress status...
       */

      dialogDisplay = (
      
        <div className="dialog-text">            
          <p className="dialog-text">
          To restrict the traversal to specific types, select the types to include.
          </p>  
          <p  className="dialog-text">
          In each column:
          </p>  
          <ul className="dialog-list">
            <li className="dialog-list-item">If NO types are checked, there is no filtering for the category. All types are permitted.</li>
            <li className="dialog-list-item">If ANY (or all) types are checked, the traversal will be restricted to the checked types.</li>
          </ul>          
          <p  className="dialog-text">
          A neighboring node can be reached if its node type and connecting line type 
          are permitted.      
          </p>       
          <hr></hr>                 
          <p  className="status-update">
          Analysing traversal...
          </p>                 
          <div className="dismiss-1-button-container">                     
            <button className="multiselect-button" onClick={cancelCallback}>  Cancel  </button>          
          </div>                         
        </div>
        
      );
    }

    else if (props.status === "complete") {

      /*
       * Display results if there are any, otherwise display empty result...
       */

      let resultsPresent = (nodeTypes   && nodeTypes.length   > 0)   ||
                           (lineTypes   && lineTypes.length   > 0)   
                           ;
                      

      if (!resultsPresent) {

        /* 
         * There is nothing to display... 
         */
     
        dialogDisplay = (
      
          <div className="dialog-text">            
            <p>
            The attempted traversal did not find any neighbors.
            </p>  
            <div className="dismiss-button-container">                     
              <button className="multiselect-button" onClick={cancelCallback}>  Cancel  </button>
              <button className="multiselect-button" onClick={submitCallback}>  OK     </button>
            </div>              
          </div>        
        );

        interactionContext.showPortal(dialogDisplay);
      }
    
      else {


        let resultsDisplay = (

          <div>
            <div className="table" >
              <div className="row">
                <div className="column">
                  <p className="dialog-text"><b>Node types</b></p>
                  {nodeTypes.map(type => ( 
                    <div key={type.name}>
                      <label className="traversal-filter-label" key={type.name}> 
                        <input type="checkbox" id={type.name} value={type.checked} onChange={nodeFilterChanged} checked={type.checked}/>
                        {type.name} ( {type.count} )         
                      </label> 
                      <br/> 
                    </div>
                  ))}    
                </div>
                <div className="column">
                  <p className="dialog-text"><b>Line types</b></p>
                  {lineTypes.map(type => ( 
                    <div key={type.name}>
                      <label  className="traversal-filter-label" key={type.name}> 
                        <input type="checkbox" id={type.name} value={type.checked} onChange={lineFilterChanged} checked={type.checked}/>
                        {type.name} ( {type.count} )         
                      </label> 
                      <br/> 
                    </div>
                  ))}    
                </div>
              </div>
            </div>    
          </div>
        );


        dialogDisplay = (
      
          <div className="dialog-text">          
            <p  className="dialog-text">
            If you wish to restrict the traversal to specific types, please select the types to include. 
            </p>
            <p  className="dialog-text">
            For each category (column):
            </p>
            <ul className="dialog-list">
              <li  className="dialog-list-item">If NO types are checked, there is no filtering for the category. All types are permitted.</li>
              <li  className="dialog-list-item">If ANY (or all) types are checked, the traversal will be restricted to the checked types.</li>
            </ul>        
            <p  className="dialog-text">
            A neighboring node can be reached if its node type is permitted and the connecting line type is permitted.
            </p>   
            <hr></hr>               
            <div className="traversal-results-area">                            
              {resultsDisplay}
            </div>            
            <div className="multiselect-button-container">               
              <button  className="multiselect-button" id="noneButton" onClick = { uncheckAll } >Clear All  </button>
              <button  className="multiselect-button" id="allButton" onClick = { checkAll } >Select All  </button>
            </div>      
            <div className="dismiss-button-container">                     
              <button className="multiselect-button" onClick={cancelCallback}>  Cancel  </button>
              <button className="multiselect-button" onClick={submitCallback}>  OK     </button>
            </div>            
          </div>
        );
      }

      interactionContext.showPortal(dialogDisplay);
    }

  };


  /*
   * Emulate componentDidMount - to append the wrapper element
   */
  const componentDidMount = () => {    

    if (props.status === "idle") {
      /*
       * NO OP
       */
    }
    if (props.status === "pending") {      
      triggerPortal();
    }
    if (props.status === "cancelled") {
      /*
       * This state can be reached because another component - such as an error handler in a REST callback
       * has abandoned the operation. It is not only reached by the user pressing the cancel button.
       */
      cancelCallback();
    }
    if (props.status === "complete") {     
      triggerPortal();
    }

   
  };
  useEffect (componentDidMount ,[ props.status, props.nodeTypes, props.lineTypes ]);
  
  /*
   * Render nothing - this component is invisible but controls what is displayed by the portal
   */
  return null;

}

TraversalResultHandler.propTypes = {  
  status               : PropTypes.string,
  onCancel             : PropTypes.func.isRequired, 
  onSubmit             : PropTypes.func.isRequired, 
  selectCallback       : PropTypes.func.isRequired, 
  setAllCallback       : PropTypes.func.isRequired, 
  //spec                 : PropTypes.object,
  nodeTypes          : PropTypes.array,                    
  lineTypes    : PropTypes.array
};