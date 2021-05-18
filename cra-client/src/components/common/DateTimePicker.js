/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import { DatePicker, DatePickerInput } from "carbon-components-react";
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
  const [timeInError, setTimeInError] = useState(false);
  const [dateInError, setDateInError] = useState(false);
  // const [dateTime, setDateTime] = useState();
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
    const timeDefined = (time !== undefined && time !== ""); 
    
    if (date === undefined && timeDefined) {
      setDateInError(true);
    } else {
      setDateInError(false);
    }

    props.onDateTimeChange(dateTime);
  }, [date, time]);
  // useEffect(() => {
  //   let message = "";
  //   if (timeInError === true) {
  //     message = "Invalid Time";
  //   }
  //   if (date === undefined && time !== undefined) {
  //     message = "Invalid do not specify a time without a date";
  //   }
  //   props.onDateTimeInvalid(message);
  // }, [timeInError, date, time ]);

  const onDateChange = (e) => {
    console.log("onDateChange " + e[0]);
    setDate(e[0]);
  };
  const onTimeChange = (e) => {
    const chosenTime = e.currentTarget.value;
    // set the time even if it is invalid .
    setTime(chosenTime);
    if (chosenTime === undefined || chosenTime === "") {
      setTimeInError(false);
    } else {
      if (isTimeStringValid(chosenTime)) {
        setTimeInError(false);
        console.log("onTimeChange " + chosenTime + " good");
      } else {
        setTimeInError(true);
      }
    }

    console.log("onTimeChange");
  };

  const getTimeValue = () => {
    let timeValue = undefined;
    if (props.value != undefined) {
      timeValue = props.value.time;
    }
    return timeValue;
  };
  const getDateValue = () => {
    let dateValue = undefined;
    if (props.value != undefined) {
      // the value needs to be the date string using the date-fns format
      if (props.value.date !== undefined) {
        dateValue = format(props.value.date, "MM/dd/Y");
      }
    }
    return dateValue;
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
            type="text"
          />
        </DatePicker>
          {dateInError ? (
            <span style={{ color: "red" }}>
              'Date is required if there is a time'
            </span>
          ) : (
            ""
          )}
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
            value={getTimeValue()}
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
