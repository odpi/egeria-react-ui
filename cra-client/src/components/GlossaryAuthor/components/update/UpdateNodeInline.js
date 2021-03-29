/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
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
import { issueRestUpdate } from "../RestCaller";

export default function UpdateNodeInline(props) {
  const [updateBody, setUpdateBody] = useState({});
  const [currentNode, setCurrentNode] = useState();
  const [errorMsg, setErrorMsg] = useState();

  useEffect(() => {
    setCurrentNode(props.node);
  }, [props]);

  console.log("UpdateNodeInline");

  const url = getUrl();
  function getUrl() {
    console.log("URL ");
    const node = props.node;
    const guid = node.systemAttributes.guid;
    return props.currentNodeType.url + "/" + guid;
  }

  const handleClickUpdate = (e) => {
    console.log("handleClickUpdate()");
    e.preventDefault();
    let body = updateBody;

    // TODO consider moving this up to a node controller as per the CRUD pattern.
    // in the meantime this will be self contained.
    // Disabling logging as CodeQL does not like user supplied values being logged.
    // console.log("issueUpdate " + url);
    issueRestUpdate(url, body, onSuccessfulUpdate, onErrorUpdate);
  };
  const onSuccessfulUpdate = (json) => {
    console.log("onSuccessfulUpdate");
    if (json.result.length === 1) {
      const node = json.result[0];
      node.gen = currentNode.gen;
      setCurrentNode(node);
    } else {
      setErrorMsg("Error did not get a node from the server");
      setCurrentNode(undefined);
    }
  };
  const onErrorUpdate = (msg) => {
    console.log("Error on Update " + msg);
    setErrorMsg(msg);
    setCurrentNode(undefined);
  };

  function updateLabelId(labelKey) {
    return "text-input-update" + props.currentNodeType.name + "-" + labelKey;
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
  return (
    <div>
      {currentNode !== undefined && (
        <div className="bx--form-item">
          <label className="bx--label">
            Version {currentNode.systemAttributes.version} of the selected{" "}
            {currentNode.nodeType} is from generation {currentNode.gen}
          </label>
        </div>
      )}
      {currentNode !== undefined &&
        props.currentNodeType.attributes.map((item) => {
          return (
            <div className="bx--form-item" key={item.key}>
              <label htmlFor={updateLabelId(item.key)} className="bx--label">
                {item.label} <Info16 />
              </label>
              <input
                id={updateLabelId(item.key)}
                type="text"
                disabled={currentNode.readOnly}
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
      {currentNode && currentNode.readOnly === false && (
        <Button
          className="bx--btn bx--btn--primary"
          onClick={handleClickUpdate}
          type="button"
        >
          Update
        </Button>
      )}
    </div>
  );
}
