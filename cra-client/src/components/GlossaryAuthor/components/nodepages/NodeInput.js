/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import { Accordion, AccordionItem } from "carbon-components-react";
import DateTimePicker from "../../../common/DateTimePicker";
import Info16 from "@carbon/icons-react/lib/information/16";
import {
  hasContent,
  isEffectivityRangeValid
} from "../../../common/Validators";

/**
 * Component to take user input for node page as part of a wizard.
 *
 * @param props.currentNodeType This is the current NodeType. The NodeType is a structure detailing the attribute names and name of a Node.
 * @param inputNode if specified this is the node to initialise the fields with in the form
 * @param operation create or update
 * @param onAttributeChange drive this method when an attribute changes.
 * @param onFromDateTimeChange from datetime has changed
 * @param onToDateTimeChange to datetime has changed
 * @returns node input
 */
export default function NodeInput(props) {
  const [errorMsg, setErrorMsg] = useState();
  const [currentAttributes, setCurrentAttributes] = useState();
  const [effectiveFrom, setEffectiveFrom] = useState();
  const [effectiveTo, setEffectiveTo] = useState();

  // update the currentAttributes with the supplied inputNode from props.
  useEffect(() => {
    if (props.currentNodeType) {
      let attributesWithValues = [];
      let attributes = props.currentNodeType.attributes;
      if (props.inputNode) {
        // now  scan through the props.inputNode properties and add in any values there.
        for (let i = 0; i < attributes.length; i++) {
          const attributeKey = attributes[i].key;
          const attributeValue = props.inputNode[attributeKey];
          let attributesWithValuesElement = attributes[i];
          if (attributeValue !== undefined) {
            attributesWithValuesElement.value = attributeValue;
          }
          attributesWithValuesElement.id = attributeKey;
          attributesWithValues.push(attributesWithValuesElement);
        }
        setCurrentAttributes(attributesWithValues);
        // pickup the effectivity
        if (props.inputNode.effectiveFromTime) {
          setEffectiveFrom(props.inputNode.effectiveFromTime);
        }
        if (props.inputNode.effectiveToTime) {
          setEffectiveTo(props.inputNode.effectiveToTime);
        }
      } else {
        let attributesWithIds = [];
        for (let i = 0; i < attributes.length; i++) {
          let attribute = attributes[i];
          const attributeKey = attribute.key;
          attribute.id = attributeKey;
          attributesWithIds.push(attribute);
        }
        setCurrentAttributes(attributesWithIds);
      }
    }
  }, [props]);
  // validate the current attributes when they change
  useEffect(() => {
    const errMsg = validateForm();
    if (errMsg === undefined) {
      setErrorMsg("");
    } else {
      setErrorMsg(errMsg);
    }
  }, [currentAttributes]);

  /**
   * If there was an error the button has a class added to it to cause it to shake. After the animation ends, we need to remove the class.
   * @param {*} e end anomation event
   */
  const handleOnAnimationEnd = (e) => {
    document
      .getElementById(labelIdForSubmitButton())
      .classList.remove("shaker");
  };

  const onFromDateTimeChange = (dateTime) => {
    props.onAttributeChange("effectiveFromTime", dateTime);
  };
  const onToDateTimeChange = (dateTime) => {
    props.onAttributeChange("effectiveToTime", dateTime);
  };

  const validateForm = () => {
    //TODO consider marking name as manditory in the nodetype definition
    let errMsg = undefined;
    if (currentAttributes !== undefined) {
      // check that if we have user input then there is a value for name
      // if we were given initial values then this needs to be checked also.
      let validName = false;
      let effectiveFromValue;
      let effectiveToValue;
      currentAttributes.map((item) => {
        const value = item.value;
        if (item.id === "name" && value !== undefined && value.length > 0) {
          validName = true;
        } else if (item.id === "effectiveFromTime") {
          effectiveFromValue = value;
        } else if (item.id === "effectiveToTime") {
          effectiveToValue = value;
        }
      });
      if (validName) {
        errMsg = "";
        if (!isEffectivityRangeValid(effectiveFromValue, effectiveToValue)) {
          errMsg = "Effectivity range incorrect, effectivity to date needs to be later than effectivity from date";
        }
      } else {
        errMsg = "Please specify a Name. ";
        console.log(errorMsg);
      }
    }

    return errMsg;
  };
  const getInputType = (item) => {
    let type = "text";
    if (item.type && item.type === "flag") {
      type = "checkbox";
    }
    return type;
  };
  const getInputClass = (item) => {
    if (item.type && item.type === "text") {
      return "className=bx--text-input";
    }
    return "";
  };
  const labelIdForAttribute = (labelKey) => {
    return "text-input-" + props.currentNodeType.name + "-" + labelKey;
  };
  const labelIdForSubmitButton = (labelKey) => {
    return props.currentNodeType.name + "ViewButton";
  };
  const setAttribute = (item, value) => {
    console.log("setAttribute " + item.key + ",value=" + value);
    props.onAttributeChange(item.key, value);
  };
  const attributeTableHeaderData = [
    {
      header: "Attribute Name",
      key: "attrName",
    },
    {
      header: "Value",
      key: "value",
    },
  ];

  return (
    <div>
      <div>
        <form>
          {props.currentNodeType &&
            currentAttributes &&
            currentAttributes
              .filter(function (obj) {
                // if notCreate is true and operation is create then do not allow
                let allow = true;
                if (props.operation === "Create" && obj.notCreate) {
                  allow = false;
                }
                return allow;
              })
              .map((item) => {
                return (
                  <div className="bx--form-item" key={item.key}>
                    <label
                      htmlFor={labelIdForAttribute(item.key)}
                      className="bx--label"
                    >
                      {item.label} <Info16 />
                    </label>
                    <input
                      id={labelIdForAttribute(item.key)}
                      type={getInputType(item)}
                      value={item.value}
                      onChange={(e) => setAttribute(item, e.target.value)}
                      placeholder={item.label}
                    ></input>
                  </div>
                );
              })}
          <Accordion>
            <AccordionItem title="Limit when active">
              <DateTimePicker
                dateLabel="Effective from date (mm/dd/yyyy)"
                timeLabel="Effective from time (hh:mm)"
                onDateTimeChange={onFromDateTimeChange}
                value={effectiveFrom}   
                onDateTimeMessage={props.onDateTimeFromMessage}
              />
              <DateTimePicker
                dateLabel="Effective to date (mm/dd/yyyy)"
                timeLabel="Effective to time (hh:mm)"
                onDateTimeChange={onToDateTimeChange}
                value={effectiveTo} 
                onDateTimeMessage={props.onDateTimeToMessage}
              />
            </AccordionItem>
          </Accordion>
          <div style={{ color: "red" }}>{errorMsg}</div>
        </form>
      </div>
    </div>
  );
}