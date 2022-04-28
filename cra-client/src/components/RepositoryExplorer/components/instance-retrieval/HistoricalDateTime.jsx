/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState } from "react";

import { Toggle } from "carbon-components-react";

import DateTimePicker from "./DateTimePicker";

import { InstancesContext } from "../../contexts/InstancesContext";

import "./instance-retriever.scss";

export default function HistoricalDateTime() {
  const instancesContext = useContext(InstancesContext);
  const [errorMessage, setErrorMessage] = useState("");
  const onErrorMessage = (msg) => {
    setErrorMessage(msg);
  };


  return (
    <div>
    <div className="descriptive-text">
      Historical Query
    </div>
    <div className="history-outline">
      <Toggle
        // labelA="Present"
        // labelB="Issue Historical query"
        id="asOfTimeToggle"
        onToggle={instancesContext.onHistoricalQueryChange}
      />
      <div id="historical_date_time_picker" style={{ display: "none" }} >
        <DateTimePicker
          dateLabel="As of Date"
          timeLabel="As of Time"
          asOfDateTimeStr={instancesContext.asOfDateTimeStr}
          onDateChange={instancesContext.onAsOfDateChange}
          onTimeChange={instancesContext.onAsOfTimeChange}
          dateValue={instancesContext.asOfDate}
          timeValue={instancesContext.asOfTimeStr}
          invalidTime={instancesContext.invalidTime}
          invalidDate={instancesContext.invalidDate}
          isTimeDisabled={instancesContext.isTimeDisabled}
          onDateTimeMessage={onErrorMessage}
        />
        {errorMessage}
      </div>
      </div>
    </div>
  );
}
