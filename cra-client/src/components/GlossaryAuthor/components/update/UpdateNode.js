/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext, useEffect } from "react";
import getPathTypesAndGuids from "../properties/PathAnalyser";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";
import {
  Accordion,
  AccordionItem,
  Button,
  DatePicker,
  DatePickerInput,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "carbon-components-react";
import Info16 from "@carbon/icons-react/lib/information/16";
import { issueRestUpdate, issueRestGet } from "../RestCaller";
import { useHistory } from "react-router-dom";

export default function UpdateNode(props) {
  const identificationContext = useContext(IdentificationContext);
  const [nodeType, setNodeType] = useState();
  const [guidToEdit, setGuidToEdit] = useState();

  useEffect(() => {
    const pathAnalysis = getPathTypesAndGuids(props.match.params.anypath);
    // we need to set up the nodeType and guid to edit

    const lastElement = pathAnalysis[pathAnalysis.length - 1];
    setGuidToEdit(lastElement.guid);
    const gotNodeType = getNodeType(
      identificationContext.getRestURL("glossary-author"),
      lastElement.type
    );
    setNodeType(gotNodeType);
  }, [props, identificationContext]);

  const [updateBody, setUpdateBody] = useState({});
  const [currentNode, setCurrentNode] = useState();
  const [errorMsg, setErrorMsg] = useState();
  console.log("UpdateNode");
  let history = useHistory();

  const initialGet = () => {
    issueRestGet(getUrl(), onSuccessfulGet, onErrorGet);
    return "Getting details";
  };
  function getUrl() {
    return nodeType.url + "/" + guidToEdit;
  }

  const handleClickUpdate = (e) => {
    console.log("handleClickUpdate()");
    e.preventDefault();
    let body = updateBody;

    // TODO consider moving this up to a node controller as per the CRUD pattern.
    // in the meantime this will be self contained.
    // Disabling logging as CodeQL does not like user supplied values being logged.
    // console.log("issueUpdate " + url);
    issueRestUpdate(getUrl(), body, onSuccessfulUpdate, onErrorUpdate);
  };
  const onSuccessfulGet = (json) => {
    console.log("onSuccessfulGet");
    if (json.result.length === 1) {
      const node = json.result[0];
      setCurrentNode(node);
    } else {
      onErrorGet("Error did not get a node from the server");
    }
  };
  const onErrorGet = (msg) => {
    console.log("Error on Get " + msg);
    setErrorMsg(msg);
    setCurrentNode(undefined);
  };
  const onSuccessfulUpdate = (json) => {
    console.log("onSuccessfulUpdate");
    if (json.result.length === 1) {
      const node = json.result[0];
      setCurrentNode(node);
    } else {
      onErrorGet("Error did not get a node from the server");
    }
  };
  const onErrorUpdate = (msg) => {
    console.log("Error on Update " + msg);
    setErrorMsg(msg);
    setCurrentNode(undefined);
  };

  function updateLabelId(labelKey) {
    return "text-input-update" + nodeType.name + "-" + labelKey;
  }
  const setAttribute = (item, value) => {
    console.log("setAttribute " + item.key + ",value=" + value);
    let myUpdateBody = updateBody;
    myUpdateBody[item.key] = value;
    setUpdateBody(myUpdateBody);
  };
  const updatedTableHeaderData = [
    {
      header: "Attribute Name",
      key: "attrName",
    },
    {
      header: "Value",
      key: "value",
    },
  ];

  const getSystemDataRowData = () => {
    let rowData = [];
    const systemAttributes = currentNode.systemAttributes;
    for (var prop in systemAttributes) {
      let row = {};
      row.id = prop;
      row.attrName = prop;

      let value = systemAttributes[prop];
      // TODO deal with the other types (and null? and arrays?) properly
      value = JSON.stringify(value);
      row.value = value;
      rowData.push(row);
    }
    return rowData;
  };

  const onClickBack = () => {
    console.log("Back clicked");
    // use history, as there is another window history object in scope in the event listener
    console.log(history);
    // go  back
    history.goBack();
  };
  return (
    <div>
      {/* the useEffect will run after the render and set the nodeType, allowing the initalGet to run and set currentNode */}
      {currentNode === undefined && nodeType && initialGet()}
      {currentNode !== undefined &&
        nodeType.attributes.map((item) => {
          return (
            <div className="bx--form-item" key={item.key}>
              <label htmlFor={updateLabelId(item.key)} className="bx--label">
                {item.label} <Info16 />
              </label>
              <input
                id={updateLabelId(item.key)}
                type="text"
                className="bx--text-input"
                defaultValue={currentNode[item.key]}
                key={currentNode[item.key]}
                onChange={(e) => setAttribute(item, e.target.value)}
                placeholder={item.label}
              ></input>
            </div>
          );
        })}
      {currentNode !== undefined && (
        <Accordion>
          <AccordionItem title="Advanced options">
            <DatePicker dateFormat="m/d/Y" datePickerType="range">
              <DatePickerInput
                // id="date-picker-range-start"
                placeholder="mm/dd/yyyy"
                labelText="Effective from date"
                type="text"
              />
              <DatePickerInput
                // id="date-picker-range-end"
                placeholder="mm/dd/yyyy"
                labelText="Effective to date"
                type="text"
              />
            </DatePicker>
          </AccordionItem>
        </Accordion>
      )}
      {currentNode !== undefined && (
        <Accordion>
          <AccordionItem title="System Attributes">
            <div className="bx--form-item">
              <DataTable
                isSortable
                rows={getSystemDataRowData()}
                headers={updatedTableHeaderData}
                render={({ rows, headers, getHeaderProps }) => (
                  <TableContainer title="System Attributes">
                    <Table size="normal">
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader
                              key={header.key}
                              {...getHeaderProps({ header })}
                            >
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              />
            </div>
          </AccordionItem>
        </Accordion>
      )}
      <div style={{ color: "red" }}>{errorMsg}</div>
      <Button
        className="bx--btn bx--btn--primary"
        onClick={handleClickUpdate}
        type="button"
      >
        Update
      </Button>
      <Button
        kind="secondary"
        className="bx--btn bx--btn--primary"
        onClick={onClickBack}
        type="button"
      >
        Back
      </Button>
    </div>
  );
}
