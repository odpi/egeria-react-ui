/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext } from "react";
import {
  DatePicker,
  DatePickerInput,
  TextInput,
} from "carbon-components-react";
import { InstancesContext } from "../../contexts/InstancesContext";
/**
 * Controlled Component (with no state) to take user input for node page as part of a wizard.
 *
 * @param props.currentNodeType This is the current NodeType. The NodeType is a structure detailing the attribute names and name of a Node.
 * @param inputNode if specified this is the node to initialise the fields with in the form
 * @param operation create or update
 * @param onAttributeChange drive this method when an attribute changes.
 * @param onDateTimeChange callback when the datetime changes an object is returned continainf the date and time that the user has input or undefined.
 * @returns node input
 */
export default function DateTimePicker(props) {
  const instancesContext = useContext(InstancesContext);

  const getDateFormat = () => {
    // TODO localise
    return "m/d/Y";
  };
  const getDateFormatPlaceHolder = () => {
    // TODO localise
    return "mm/dd/yyyy";
  };

  return (
    <div className="flexcontainer-column">
      <div className="flexcontainer-row">
        <div>
          <DatePicker
            dateFormat={getDateFormat()}
            datePickerType="single"
            onChange={instancesContext.onAsOfDateChange}
          >
            <DatePickerInput
              placeholder={getDateFormatPlaceHolder()}
              labelText={props.dateLabel}
              id={props.dateLabel}
              value={instancesContext.asOfFormattedDate}
              invalid={instancesContext.invalidDate}
              invalidText={"Invalid Dates are not accepted"}
              type="text"
            />
          </DatePicker>
        </div>
        <div>
          <div className="bx--date-picker-container time-picker__width">
            <label className="bx--label" htmlFor={props.timeLabel}>
              {props.timeLabel}
            </label>
            <TextInput
              disabled={instancesContext.isTimeDisabled}
              id={props.timeLabel}
              value={instancesContext.asOfTimeStr}
              invalid={instancesContext.invalidTime}
              invalidText="A valid time value is required, of the form hh:mm"
              label={props.timeLabel}
              //   pattern="(0[0123]|[1-9]):[0-5][0-9](\\s)?"
              placeholder="hh:mm"
              maxLength="5"
              onChange={instancesContext.onAsOfTimeChange}
            />
          </div>
        </div>
      </div>
      <div className="datetimestr">{instancesContext.asOfDateTimeStr} </div>
    </div>
  );
}
