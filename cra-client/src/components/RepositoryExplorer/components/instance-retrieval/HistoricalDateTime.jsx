/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState } from "react";

import { Toggle } from "carbon-components-react";

import DateTimePicker from "./DateTimePicker";

import { InstancesContext } from "../../contexts/InstancesContext";

import "./instance-retriever.scss";

export default function HistoricalDateTime() {
  const instancesContext = useContext(InstancesContext);

  return (
    <div>
      <div className="descriptive-text">Historical Query</div>
      <div className="history-outline">
        <Toggle
          // labelA="Present"
          // labelB="Issue Historical query"
          id="asOfTimeToggle"
          onToggle={instancesContext.onHistoricalQueryChange}
        />
        {instancesContext.useHistoricalQuery === true && (
          <div>
            <DateTimePicker
              dateLabel="As of Date"
              timeLabel="As of Time"
            />
            { instancesContext.asOfDate === undefined &&
              <div  style={{ color: "red" }}> Please input a date for histrorical queries  </div>
            }
            
          </div>
        ) }
      </div>
    </div>
  );
}
