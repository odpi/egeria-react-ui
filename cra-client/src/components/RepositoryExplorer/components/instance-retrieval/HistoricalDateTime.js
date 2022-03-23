/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState } from "react";

import PropTypes from "prop-types";

import DateTimePicker from "../../../common/DateTimePicker";

import { InstancesContext } from "../../contexts/InstancesContext";

import "./instance-retriever.scss";

export default function HistoricalDateTime() {
  const instancesContext = useContext(InstancesContext);
  const [errorMessage, setErrorMessage] = useState("");

  const onDateTimeChange = (dateTime) => {
    console.log("onDateTimeChange");
    if (dateTime === undefined) {
      console.log("dateTime === undefined");
    } else {
      console.log(JSON.stringify(dateTime));
    }
  
    instancesContext.onDateTimeChanged(dateTime);
  };
  const onErrorMessage = (msg) => {
    setErrorMessage(msg);
  };

  return (
        <div className="history-outline">
           <div>History</div>
           <div>Date time value: {instancesContext.asOfDateTimeLocalStr} </div>
          <DateTimePicker
            dateLabel="As of Date"
            timeLabel="As of Time"
            onDateTimeChange={onDateTimeChange}
            value={instancesContext.asOfDateTime}
            onDateTimeMessage={onErrorMessage}
          />
          {errorMessage}
    </div>
  );
}

