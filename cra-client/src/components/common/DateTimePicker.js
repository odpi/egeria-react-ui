/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState } from "react";
import { DatePicker, DatePickerInput } from "carbon-components-react";
export default function DateTimePicker(props) {
  const [timeInError, setTimeInError] = useState(false);

  const onDateChange = (e) => {
    console.log("onDateChange");
  };
  const onTimeChange = (e) => {
    if (e.currentTarget.value === undefined || e.currentTarget.value === "") {
        setTimeInError(false);
    } else {
      const regex = new RegExp("^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
      const isValid = regex.test(e.currentTarget.value);
      if (isValid) {
        setTimeInError(false);
        console.log("onTimeChange " + e.currentTarget.value + " good");
      } else {
        setTimeInError(true);
      }
    }
    console.log("onTimeChange");
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
    <div className="container">
      <DatePicker dateFormat={getDateFormat()} datePickerType="single">
        <DatePickerInput
          placeholder={getDateFormatPlaceHolder()}
          labelText={props.dateLabel}
          type="text"
          onChange={onDateChange}
        />
      </DatePicker>
      <div className="bx--date-picker-container">
        <label className="bx--label" htmlFor={props.timeLabel}>
          {props.timeLabel}
        </label>
        <input
          className="bx--date-picker__input flatpickr-input"
          type="text"
          id={props.timeLabel}
          label={props.timeLabel}
          //   pattern="(0[0123]|[1-9]):[0-5][0-9](\\s)?"
          placeholder="hh:mm (UTC)"
          maxLength="5"
          onChange={onTimeChange}
        />
        {timeInError ? (
          <span style={{ color: "red" }}>
            If specified the time should be of the form 'hh:mm' when hh and mm
            are the hours and minutes of a 24 hour clock
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
