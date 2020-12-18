/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useState }                from "react";

import PropTypes                           from "prop-types";

import "./details-panel.scss";

import ServerRunHistoryHandler             from "./ServerRunHistoryHandler";


export default function ServerStatusDisplay(props) {

  const inStatus         = props.serverStatus;
  const serverName       = props.serverName;

  let outStatus;



  const [historyStatus, setHistoryStatus]     = useState("idle");


  /*
   * Handler to render server config audit trail in portal
   */
  const displayServerRunHistory = (serverName, history) => {
    //setHistory({"serverName" : serverName , "history" : history });
    setHistoryStatus("complete");
  }

  const cancelHistoryModal = () => {
    setHistoryStatus("idle");
  };

  const submitHistoryModal = () => {
    setHistoryStatus("idle");
  };


  const expandStatus = (inStatus) => {

    let statusDisplay = (
      <div>
        <ul className="details-sublist">
          <li className="details-sublist-item">Server Status : {inStatus.isActive ? <span>ACTIVE</span> : <span>STOPPED</span>}</li>
          <li className="details-sublist-item">Server Start Time : {inStatus.isActive ? inStatus.serverStartTime : <i>not applicable</i>}</li>
          <li className="details-sublist-item">Server End Time : {inStatus.isActive ? <i>not applicable</i>  : inStatus.serverEndTime}</li>


          <li>
          <button onClick = { () => displayServerRunHistory(serverName, inStatus.serverHistory) }>
            Server Run History
            </button>
            <ServerRunHistoryHandler   status                = { historyStatus }
                                       serverName            = { serverName }
                                       history               = { inStatus.serverHistory }
                                       onCancel              = { cancelHistoryModal }
                                       onSubmit              = { submitHistoryModal } />
          </li>
        </ul>
      </div>
    );

    return statusDisplay;
  };




  if (!inStatus) {
    outStatus = (
      <div>
        nothing to display
      </div>
    )
  }
  else {
   
    outStatus = (              
      <ul className="type-details-item">       
       {expandStatus(inStatus)}          
      </ul>
      
    );
  }

  return outStatus;
}

ServerStatusDisplay.propTypes = {
  serverName   : PropTypes.string,
  serverStatus : PropTypes.object
};
