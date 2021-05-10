/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import { DatePicker, DatePickerInput } from "carbon-components-react";
import { parse } from "date-fns";
import { AlignBoxTopCenter16 } from "@carbon/icons-react";
export default function DateTimePicker(props) {
  const [timeInError, setTimeInError] = useState(false);
  // const [dateTime, setDateTime] = useState();
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  let dateTime = undefined;
  useEffect(() => {
    let dateTime = undefined;
    // if date is not defined then time should not be either. No effectivity. 
    if (date !== undefined) {
      if (time !== undefined && time !== "") {
        // a date and time have been specified
        // parse the time string using the reference date to fill in any other values.
        dateTime = parse(time, "HH:mm", date);
      } else {
        // date is defined but time is not; this is valid
        dateTime = date;
      }
    }
    props.onDateTimeChange(dateTime);
  }, [date, time]);
  useEffect(() => {
    let message = "";
    if (timeInError === true) {
      message = "Invalid Time";
    }
    if (date === undefined && time !== undefined) {
      message = "Invalid do not specify a time without a date";
    }
    props.onDateTimeInvalid(message);
  }, [timeInError, date, time ]);

  const onDateChange = (e) => {
    console.log("onDateChange " + e[0]);
    setDate(e[0]);
  };
  const onTimeChange = (e) => {
    const chosenTime = e.currentTarget.value;
    if (chosenTime === undefined || chosenTime === "") {
      setTimeInError(false);
      setTime(chosenTime);
    } else {
      const regex = new RegExp("^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
      const isTimeValid = regex.test(chosenTime);
      
      if (isTimeValid) {
        setTimeInError(false);
        setTime(chosenTime);
        console.log("onTimeChange " + chosenTime + " good");
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
            type="text"
          />
        </DatePicker>
      </div>
      <div>
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
            <span style={{ color: "red" }}>Incorrect, should be 'hh:mm'</span>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
