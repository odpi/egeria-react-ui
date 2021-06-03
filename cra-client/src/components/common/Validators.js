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
      if ((from.time && from.time.invalid) || (to.time && to.time.invalid)) {
        isValid = false;
      } else {
        let fromDate;
        if (from.date === undefined || from.date.value === undefined) {
          // to.date is defined to have got here.
          // we interpret this as now
          fromDate = new Date();
        } else {
          fromDate = from.date.value;
        }
        let toDate;
        if (to.date === undefined || from.date.value === undefined) {
          toDate = undefined;
        } else {
          toDate = to.date.value;
        }
        // copy over the time values only if we have them.
        let fromTime;
        if (from.time) {
          fromTime = from.time.value;
        }
        let toTime;
        if (to.time) {
          toTime = to.time.value;
        }

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
        if (toDate === undefined) {
          isValid = false;
        } else {
          const fromMillis = fromDateTime.getTime();
          const toMillis = toDateTime.getTime();

          if (isValid && fromMillis >= toMillis) {
            isValid = false;
          }
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
 * @returns boolean indicating whether it is valid or not.
 */
export const isEffectivityDateRangeValid = (from, to) => {
  let isValid = true;
  if (from === undefined || to === undefined) {
    //valid
  } else {
    // from.date or to.date could be undefined.
    if (to.date === undefined || to.date.value === undefined) {
      // valid - no end date
    } else {
      const toDate = to.date.value;
      let fromDate;
      if (from.date === undefined || from.date.value === undefined) {
        // to.date is defined to have got here.
        // we interpret this as now
        fromDate = new Date();
      } else {
        fromDate = from.date.value;
      }
      const fromMillis = fromDate.getTime();
      const toMillis = toDate.getTime();
      // can have the same day - the time check ids then needed to work out which is earlier or later
      if (isValid && fromMillis > toMillis) {
        isValid = false;
      }
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
 * Driven for nodes and relationships
 * Check for invalid being set to true for all the properties. For datetimes the invalid property is on the time and date properties.
 * @param {*} userInput
 * @returns true if valid i.e. (i.e. does not have a property with invalid = true)
 */
export const validatePropertiesUserInput = (userInput, isRelationship) => {
  let isValid = true;
  if (userInput === undefined) {
    isValid = false;
  } else {
    for (let property in userInput) {
      const propertyValue = userInput[property];
      if (property === "effectiveFromTime" || property === "effectiveToTime") {
        if (
          propertyValue !== undefined &&
          !isObjectValueValid(propertyValue.date)
        ) {
          isValid = false;
        }
        if (
          propertyValue !== undefined &&
          !isObjectValueValid(propertyValue.time)
        ) {
          isValid = false;
        }
      } else if ((isRelationship !== true) && !isObjectValueValid(propertyValue)) {
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
export const extendUserInput = (userInput, attributeKey, attributeValue, isRelationship) => {
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
    (nameValue !== undefined && !hasContent(nameValue.value) && isRelationship !==true)
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

  if (fromValue !== undefined && toValue !== undefined) {
    if (isEffectivityDateRangeValid(fromValue, toValue)) {
      // date range is valid. We can have undefined values for dates
      if (fromValue.date === undefined) {
        // default to now
        fromValue.date = {};
        fromValue.date.value = new Date();
      }
      if (toValue.date === undefined) {
        // create an object so we can set the invalid flag as false on it.
        toValue.date = {};
      }

      fromValue.date.invalid = false;
      toValue.date.invalid = false;
      if (isEffectivityRangeValid(fromValue, toValue)) {
        // time is valid but might be undefined
        if (fromValue.time === undefined) {
          fromValue.time = {};
        }
        if (toValue.time === undefined) {
          toValue.time = {};
        }
        fromValue.time.invalid = false;
        toValue.time.invalid = false;
      } else {
        // check time format
        if (
          (fromValue && fromValue.time && fromValue.time.invalid) ||
          (toValue && toValue.tine && toValue.time.invalid)
        ) {
          // already labelled invalid
        } else {
          // same date but the time range is not valid.
          if (!fromValue) {
            fromValue = {};
            fromValue.time = {};
          } else if (! fromValue.time) {
            fromValue.time = {};
          }
          fromValue.time.invalid = true;
          fromValue.time.invalidText =
            "Invalid, needs to be earlier than 'the Effective to time'";
          if (!toValue) {
            toValue = {};
            toValue.time = {};
          } else if (!toValue.time){
            toValue.time = {};
          }
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
      // do not need to check that there is no date and a time - as the ui does not allow a time to be entered until a date is entered.
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
