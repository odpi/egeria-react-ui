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
  if (text === undefined) {
    isValid = true;
  } else {
    const regex = new RegExp("^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
    if (text === "" || regex.test(text)) {
      isValid = true;
    }
  }
  return isValid;
};
/**
 * validate from and to effectivity date times.
 * The input when specified is an object containing date and time properties.
 * The date is a js date object and the time is a string
 *
 * @param {*} from valid object or undefined
 * @param {*} to valid object or undefined
 * @returns
 */
export const isEffectivityRangeValid = (from, to) => {
  let isValid = true;
  if (from === undefined && to === undefined) {
    //valid
  } else {

    if (from !== undefined && to !== undefined) {
      if (from.time.invalid || to.time.invalid) {
        isValid = false;
      } else {
        const fromTime = from.time.value;
        const fromDate = from.date.value;
        const toTime = to.time.value;
        const toDate = to.date.value;

        let fromDateTime;
        let toDateTime;
        if (hasContent(fromTime)) {
          fromDateTime = parse(fromTime, "HH:mm", fromDate);
        } else {
          fromDateTime = fromDate;
        }
        if (hasContent(toTime)) {
          toDateTime = parse(toTime, "HH:mm", toDate);
        } else {
          toDateTime = toDate;
        }
        const fromMillis = fromDateTime.getTime();
        const toMillis = toDateTime.getTime();

        if (isValid && fromMillis >= toMillis) {
          isValid = false;
        }
      }
    }
  }
  return isValid;
};
/**
 * Check the date range is valid
 * @param {*} from from datetime
 * @param {*} to to datetime
 * @returns boolean indicating whetehr it is valid or not.
 */
export const isEffectivityDateRangeValid = (from, to) => {
  let isValid = true;
  if (from === undefined || to === undefined) {
    //valid
  } else {
    const fromDate = from.date.value;
    const toDate = to.date.value;
    const fromMillis = fromDate.getTime();
    const toMillis = toDate.getTime();
    // can have the same day - the time check ids then needed to work out which is earlier or later
    if (isValid && fromMillis > toMillis) {
      isValid = false;
    }
  }
  return isValid;
};
/**
 * Text whether an object contains a field called invalid that is true
 * @param {*} obj 
 * @returns true if valid (i.e. does not have invalid = true)
 */
const isObjectValueValid = (obj) => {
  let isValid = true;
  if (obj !== undefined && obj.invalid === true) {
    isValid = false;
  }
  return isValid;
};   
/**
 * check for invalid being set to true for all the properties. For datetimes the invalid property is on the time and date properties. 
 * @param {*} userInput 
 * @returns true if valid i.e. (i.e. does not have a property with invalid = true) 
 */
export const validateNodePropertiesUserInput = (userInput) => {
  let isValid = true;
  if (userInput === undefined) {
    isValid = false;
  } else {
    for (let property in userInput) {
      const propertyValue =  userInput[property];
      if (property === "effectiveFromTime" || property === "effectiveToTime") {
       
        if ( propertyValue !== undefined && !isObjectValueValid(propertyValue.date)) {
          isValid = false;
        } 
        if ( propertyValue !== undefined && !isObjectValueValid(propertyValue.time)) {
          isValid = false;
        } 
        
      } else if (!isObjectValueValid(propertyValue)) {
        isValid = false;
      }
    }
  }

  return isValid;
};
/**
 * UserInput object has properties that are the attribute name. The value of an attribute is an object
 * that has a value (which is the users input and an invalidText property which if set contains
 * the current userInput. This function extends / amends the userInput to include the supplied attribute.
 * As part of this procssing we work out whether the attreibute is invalid and include invalidText content if it is.
 * The above is true for simple attributes. For a effectiveFromDate and effectiveToDate, the attributeValue comes though
 * as an objectcontining a date and time. Validation checks are issue on thedate and time and the date and/or time are
 * embellished with an invalidText if it is invalid
 *
 * @param {*} userInput existing user input object
 * @param {*} attributeKey name of the property
 * @param {*} attributeValue value of the property (could be invalid)
 * @returns amended UserInput including the supplied attribute content
 */
export const extendUserInput = (userInput, attributeKey, attributeValue) => {
  // let isDateTimeValid = false;
  let attributeObject = {};
  if (
    attributeValue !== undefined &&
    (attributeKey === "effectiveFromTime" || attributeKey === "effectiveToTime")
  ) {
    // isDateTimeValid = true;
    const time = attributeValue.time;
    const date = attributeValue.date;

    let timeObject = {};
    let dateObject = {};
    timeObject.value = time;
    timeObject.invalid = false;
    dateObject.value = date;
    dateObject.invalid = false;
    attributeObject.time = timeObject;
    attributeObject.date = dateObject;
  } else {
    // simple attributes
    attributeObject.value = attributeValue;
    attributeObject.invalid = false;
  }

  let extendedUserInput = {
    ...userInput,
    [attributeKey]: attributeObject,
  };

  // at this stage we have an object that contains the up to date values for all the attributes

  let fromValue;
  let toValue;
  let nameValue;
  for (let prop in extendedUserInput) {
    if (prop === "effectiveFromTime") {
      fromValue = extendedUserInput[prop];
    } else if (prop === "effectiveToTime") {
      toValue = extendedUserInput[prop];
    } else if (prop === "name") {
      nameValue = extendedUserInput[prop];
    }
  }

  // check name and embellish with error messsage if invalid
  if (
    nameValue === undefined ||
    (nameValue !== undefined && !hasContent(nameValue.value))
  ) {
    let attributeObject = {};
    attributeObject.value = undefined;
    attributeObject.invalidText = "Please supply a Name";
    attributeObject.invalid = true;
    extendedUserInput = {
      ...extendedUserInput,
      ["name"]: attributeObject,
    };
  }
  let attributeFromObject = extendDateTimeAttributeObject(fromValue);
  extendedUserInput = {
    ...extendedUserInput,
    ["effectiveFromTime"]: attributeFromObject,
  };

  let attributeToObject = extendDateTimeAttributeObject(toValue);
  extendedUserInput = {
    ...extendedUserInput,
    ["effectiveToTime"]: attributeToObject,
  };
  // only set the range errors if the times are valid.
  if (fromValue !== undefined && toValue !== undefined) {
    if (isEffectivityDateRangeValid(fromValue, toValue)) {
      // date range is valid
      fromValue.date.invalid = false;
      toValue.date.invalid = false;
      if (isEffectivityRangeValid(fromValue, toValue)) {
        // time is valid
        fromValue.time.invalid = false;
        toValue.time.invalid = false;
      } else {
        // check time format
        if (fromValue.time.invalid || toValue.time.invalid) {
          // already labelled invalid
        } else {
          // same date but the time range is not valid.
          fromValue.time.invalid = true;
          fromValue.time.invalidText =
            "Invalid, needs to be earlier than 'the Effective to time'";
          toValue.time.invalid = true;
          toValue.time.invalidText =
            "Invalid needs to be later than the 'Effective from time'";
        }
      }
    } else {
      // date range invalid.
      fromValue.date.invalid = true;
      fromValue.date.invalidText =
        "Invalid, needs to be earlier than 'the Effective to date'";
      toValue.date.invalid = true;
      toValue.date.invalidText =
        "Invalid needs to be later than the 'Effective from date'";
    }
    extendedUserInput = {
      ...extendedUserInput,
      ["effectiveFromTime"]: fromValue,
      ["effectiveToTime"]: toValue,
    };
  }
  return extendedUserInput;
};

/**
 * This function is suppied an object. If it isdefined if should have a time property which is a time string and date property containing a
 * Date object. This function validates that the supplied date and time are valid and if they are invalid it updates the object with the
 * invalid flag and invalidText message
 * @param {*} attributeObject
 */
export const extendDateTimeAttributeObject = (attributeObject) => {
  let extendedAttributeObject = attributeObject;
  if (attributeObject === undefined) {
    extendedAttributeObject = undefined;
  } else {
    let timeObject = attributeObject.time;
    let dateObject = attributeObject.date;
    if (dateObject !== undefined) {
      dateObject.invalid = false;
    }
    if (timeObject !== undefined) {
      timeObject.invalid = false;
    }
    if (
      timeObject !== undefined ||
      (timeObject !== undefined && timeObject.value !== undefined)
    ) {
      if (
        dateObject === undefined ||
        (dateObject !== undefined && dateObject.value === undefined)
      ) {
        // time without a date is invalid
        dateObject.invalidText = "Cannot have a time without a date";
        dateObject.invalid = true;
      }
      if (timeObject !== undefined && !isTimeStringValid(timeObject.value)) {
        // the time specified is not in the right format
        timeObject.invalidText = "Invalid time: please use hh:ss";
        timeObject.invalid = true;
      }
    }
    extendedAttributeObject = {
      ...extendedAttributeObject,
      ["time"]: timeObject,
      ["date"]: dateObject,
    };
  }

  return extendedAttributeObject;
};
