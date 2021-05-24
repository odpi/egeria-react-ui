/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import {
  DatePicker,
  DatePickerInput,
  TextInput,
} from "carbon-components-react";
import { isTimeStringValid } from "./Validators";
import format from "date-fns/format";
/**
 * Component to take user input for node page as part of a wizard.
 *
 * @param props.currentNodeType This is the current NodeType. The NodeType is a structure detailing the attribute names and name of a Node.
 * @param inputNode if specified this is the node to initialise the fields with in the form
 * @param operation create or update
 * @param onAttributeChange drive this method when an attribute changes.
 * @param onDateTimeChange callback when the datetime changes an object is returned continainf the date and time that the user has input or undefined.
 * @returns node input
 */
export default function DateTimePicker(props) {

  const [date, setDate] = useState();
  const [time, setTime] = useState();

  useEffect(() => {
    let dateTime = undefined;
    // if date is not defined then time should not be either. No effectivity.
    if (date !== undefined || time !== undefined) {
      dateTime = {};
      dateTime.date = date;
      dateTime.time = time;
    }

    props.onDateTimeChange(dateTime);
  }, [date, time]);

  const onDateChange = (e) => {
    console.log("onDateChange " + e[0]);
    setDate(e[0]);
  };
  const onTimeChange = (e) => {
    const chosenTime = e.currentTarget.value;
    // set the time even if it is invalid .
    setTime(chosenTime);
    console.log("onTimeChange");
  };

  const getTimeValue = () => {
    let timeValue = undefined;
    if (props.value != undefined && props.value.time != undefined) {
      timeValue = props.value.time.value;
    }
    return timeValue;
  };
  const getTimeInvalid = () => {
    let invalid = false;
    if (props.value != undefined && props.value.time != undefined) {
      invalid = props.value.time.invalid;
    }
    return invalid;
  };
  const getTimeInvalidText = () => {
    let invalidText = false;
    if (props.value != undefined && props.value.time != undefined) {
      invalidText = props.value.time.invalidText;
    }
    return invalidText;
  };
  const getDateValue = () => {
    let dateValue = undefined;

    // the value needs to be the date string using the date-fns format
    if (
      props.value != undefined &&
      props.value.date != undefined &&
      props.value.date.value != undefined
    ) {
      dateValue = format(props.value.date.value, "MM/dd/Y");
    }
    return dateValue;
  };

  const getDateInvalid = () => {
    let invalid = false;
    if (
      props.value != undefined &&
      props.value.date != undefined &&
      props.value.date.invalid != undefined
    ) {
      invalid = props.value.date.invalid;
    }
    return invalid;
  };
  const getDateInvalidText = () => {
    let invalidText = false;
    if (props.value != undefined && props.value.date != undefined) {
      invalidText = props.value.date.invalidText;
    }
    return invalidText;
  };

  const getDateFormat = () => {
    // TODO localise
    return "m/d/Y";
  };
  const getDateFormatPlaceHolder = () => {
    // TODO localise
    return "mm/dd/yyyy";
  };

  return (
    <div className="flexcontainer">
      <div>
        <DatePicker
          dateFormat={getDateFormat()}
          datePickerType="single"
          onChange={onDateChange}
        >
          <DatePickerInput
            placeholder={getDateFormatPlaceHolder()}
            labelText={props.dateLabel}
            value={getDateValue()}
            invalid={getDateInvalid()}
            invalidText={getDateInvalidText()}
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
            id={props.timeLabel}
            value={getTimeValue()}
            invalid={getTimeInvalid()}
            invalidText={getTimeInvalidText()}
            label={props.timeLabel}
            //   pattern="(0[0123]|[1-9]):[0-5][0-9](\\s)?"
            placeholder="hh:mm (UTC)"
            maxLength="5"
            onChange={onTimeChange}
          />
          {/* {timeInError ? (
            <span style={{ color: "red" }}>Incorrect, should be 'hh:mm'</span>
          ) : (
            ""
          )} */}
        </div>
      </div>
    </div>
  );
}
