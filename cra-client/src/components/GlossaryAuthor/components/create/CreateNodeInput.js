/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import { Accordion, AccordionItem } from "carbon-components-react";
import DateTimePicker from "../../../common/DateTimePicker";
import Info16 from "@carbon/icons-react/lib/information/16";

/**
 * Component to take user input for create node page.
 *
 * @param props.currentNodeType This is the current NodeType. The NodeType is a structure detailing the attribute names and name of a Node.
 * @param props.onGotCreateInput if specified this function is called when the input is amended
 * @param nodeToCreate if specified this is the node to initialise the fields with in the form
 * @returns create input
 */
export default function CreateNodeInput(props) {
  const [errorMsg, setErrorMsg] = useState();
  const [currentAttributes, setCurrentAttributes] = useState();
  const [fromDateTimeMessage, setFromDateTimeMessage] = useState();
  const [toDateTimeMessage, setToDateTimeMessage] = useState();

  // update the currentAttributes with the supplied nodeToCreate from props.
  useEffect(() => {
    if (props.currentNodeType) {
      let attributesWithValues = [];
      let attributes = props.currentNodeType.attributes;
      if (props.nodeToCreate) {
        // now  scan through the props.nodeToCreate properties and add in any values there.
        for (var i = 0; i < attributes.length; i++) {
          const attributeKey = attributes[i].key;
          const attributeValue = props.nodeToCreate[attributeKey];
          let attributesWithValuesElement = attributes[i];
          if (attributeValue !== undefined) {
            attributesWithValuesElement.value = attributeValue;
          }
          attributesWithValuesElement.id = attributeKey;
          attributesWithValues.push(attributesWithValuesElement);
        }
        setCurrentAttributes(attributesWithValues);
      } else {
        let attributesWithIds = [];
        for (var i = 0; i < attributes.length; i++) {
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
      .getElementById(createLabelIdForSubmitButton())
      .classList.remove("shaker");
  };

  const onFromDateTimeChange = (dateTime) => {
    let value = undefined;
    if (dateTime !== undefined) {
      value = dateTime.getTime();
    }
    props.onAttributeChange("effectiveFromTime", value);
  };
  const onToDateTimeChange = (dateTime) => {
    let value = undefined;
    if (dateTime !== undefined) {
      value = dateTime.getTime();
    }
    props.onAttributeChange("effectiveToTime", value);
  };
  const onFromDateTimeInvalid = (msg) => {
    // alert(msg);
  };
  const onToDateTimeInvalid = (msg) => {
    // alert(msg);
  };

  const validateForm = () => {
    //TODO consider marking name as manditory in the nodetype definition
    let errMsg = undefined;
    if (currentAttributes !== undefined) {
      // check that if we have user input then there is a value for name
      // if we were given initial values then this needs to be checked also.
      let validName = false;
      let validFromTime = false;
      let validToTime = false;
      currentAttributes.map((item) => {
        const value = item.value;
        if (item.id === "name" && value !== undefined && value.length > 0) {
          validName = true;
        }
        if (
          item.id === "effectiveFromTime" &&
          value !== undefined &&
          value.length > 0
        ) {
          validFromTime = true;
        }
        if (
          item.id === "effectiveToTime" &&
          value !== undefined &&
          value.length > 0
        ) {
          validToTime = true;
        }
        //"effectiveFromTime"
      });
      if (!validName) {
        errMsg = "Please specify a Name. ";
        console.log(errorMsg);
      }
      // if (fromDateTimeMessage !== undefined && fromDateTimeMessage !== "") {
      //   if (errMsg === undefined) {
      //     errMsg = "";
      //   }
      //   errMsg = errMsg + "Effective From Time : " + fromDateTimeMessage + ". ";
      // }
      // if (toDateTimeMessage !== undefined && toDateTimeMessage !== "") {
      //   if (errMsg === undefined) {
      //     errMsg = "";
      //   }
      //   errMsg = errMsg + "Effective To Date : " + toDateTimeMessage + ".";
      // }
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
  const createLabelIdForAttribute = (labelKey) => {
    return "text-input-create" + props.currentNodeType.name + "-" + labelKey;
  };
  const createLabelIdForSubmitButton = (labelKey) => {
    return props.currentNodeType.name + "CreateViewButton";
  };
  const setAttribute = (item, value) => {
    console.log("setAttribute " + item.key + ",value=" + value);
    // can't just let myCreateInput = createInput; then push the new value in, as the hooks do not see it as a new object
    // let myCreateInput = { ...createInput, [item.key]: value };
    // let changedAttribute = {};
    // changedAttribute[item.key] = value;
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
                // if notCreate is only allow it not notCreate.
                return !obj.notCreate;
              })
              .map((item) => {
                return (
                  <div className="bx--form-item" key={item.key}>
                    <label
                      htmlFor={createLabelIdForAttribute(item.key)}
                      className="bx--label"
                    >
                      {item.label} <Info16 />
                    </label>
                    <input
                      id={createLabelIdForAttribute(item.key)}
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
                dateLabel="Effective from date"
                timeLabel="Effective from time"
                onDateTimeChange={onFromDateTimeChange}
                onDateTimeInvalid={onFromDateTimeInvalid}
              />
              <DateTimePicker
                dateLabel="Effective to date"
                timeLabel="Effective to time"
                onDateTimeChange={onToDateTimeChange}
                onDateTimeInvalid={onToDateTimeInvalid}
              />
            </AccordionItem>
          </Accordion>
          <div style={{ color: "red" }}>{errorMsg}</div>
        </form>
      </div>
    </div>
  );
}
