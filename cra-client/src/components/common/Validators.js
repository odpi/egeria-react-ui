/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import { parse } from "date-fns";

export const hasContent = (text) => {
  let isValid = false;
  if (text !== undefined && text.length > 0) {
    isValid = true;
  }
  return isValid;
};
export const isTimeStringValid = (text) => {
  let isValid = false;
  const regex = new RegExp("^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
  if (text === "" || regex.test(text)) {
    isValid = true;
  }
  return isValid;
};
/**
 * validate from and to effectivity date times.
 * The input when specified is an object ocntinain a date and time properties.
 * The date is a js date object and the time is a string
 *
 * @param {*} from valid object or undefined
 * @param {*} to valid object or undefined
 * @returns
 */
export const isEffectivityRangeValid = (from, to) => {
  let isValid = true;
  if (from === undefined && to !== undefined) {
    // check against a current from date.
    from = new Date();
  }

  if (from !== undefined && to !== undefined) {
    const fromTime = from.time;
    const fromDate = from.date;
    const toTime = to.time;
    const toDate = to.date;

    let fromDateTime;
    let toDateTime;
    if (hasContent(fromTime)) {
      if (isTimeStringValid(fromTime)) {
        fromDateTime = parse(fromTime, "HH:mm", fromDate);
      } else {
        isValid = false;
      }
    } else {
      fromDateTime = fromDate;
    }
    if (hasContent(toTime)) {
      if (isTimeStringValid(toTime)) {
        toDateTime = parse(toTime, "HH:mm", toDate);
      } else {
        isValid = false;
      }
      toDateTime = parse(toTime, "HH:mm", toDate);
    } else {
      toDateTime = toDate;
    }
    const fromMillis = fromDateTime.getTime();
    const toMillis = toDateTime.getTime()

    if (isValid && (fromMillis >= toMillis)) {
      isValid = false;
    }
  }
  return isValid;
};
export const validateNodePropertiesUserInput = (userInput) => {
  let isValid = true;
  if (userInput === undefined) {
    isValid = false;
  } else {
    let fromDateTime = userInput.effectiveFromTime;
    let toDateTime = userInput.effectiveToTime;

    if (!hasContent(userInput.name)) {
      isValid = false;
    }
    if (fromDateTime !== undefined) {
      if (
        fromDateTime.date === undefined &&
        hasContent(fromDateTime.time)
      ) {
        isValid = false;
      }
      if (
        fromDateTime.time !== undefined &&
        !isTimeStringValid(fromDateTime.time)
      ) {
        isValid = false;
      }
    }
    if (toDateTime !== undefined) {
      if (toDateTime.date === undefined && toDateTime.time !== undefined) {
        isValid = false;
      }
      if (
        toDateTime.time !== undefined &&
        !isTimeStringValid(toDateTime.time)
      ) {
        isValid = false;
      }
    }
    if (isValid) {
      // the to and from dates are unspecified or valid
      // Now check that the to is after the from    
      isValid = isEffectivityRangeValid(fromDateTime, toDateTime);
   }
  }
 

  return isValid;
};
