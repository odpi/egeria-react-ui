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
import { issueRestUpdate } from "../../../common/RestCaller";

export default function UpdateRelationshipInline(props) {
  const [updateBody, setUpdateBody] = useState({});
  const [currentRelationship, setCurrentRelationship] = useState();
  const [errorMsg, setErrorMsg] = useState();

  useEffect(() => {
    setCurrentRelationship(props.relationship);
  }, [props]);

  console.log("UpdateRelationshipInline");

  const url = getUrl();
  function getUrl() {
    console.log("URL ");
    const relationship = props.relationship;
    const guid = relationship.systemAttributes.guid;
    return props.currentRelationshipType.url + "/" + guid;
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
      const relationship = json.result[0];
      relationship.gen = currentRelationship.gen;
      setCurrentRelationship(relationship);
    } else {
      setErrorMsg("Error got an attempting to update.");
      setCurrentRelationship(undefined);
    }
  };
  const onErrorUpdate = (msg) => {
    console.log("Error on Update " + msg);
    setErrorMsg(msg);
    setCurrentRelationship(undefined);
  };

  function updateLabelId(labelKey) {
    return (
      "text-input-update" + props.currentRelationshipType.name + "-" + labelKey
    );
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
    const systemAttributes = currentRelationship.systemAttributes;
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
      {currentRelationship !== undefined && (
        <div>
        <div className="bottom-margin">
          <div className="bx--form-item">
            <div className="selected-artifact-header">
              {currentRelationship.relationshipType} selected
            </div>
            <div>
              The version of the {currentRelationship.relationshipType} on the
              server is {currentRelationship.systemAttributes.version}.{" "}
            </div>
            <div>
              The generation on the canvas of the{" "}
              {currentRelationship.relationshipType} is{" "}
              {currentRelationship.gen}{" "}
            </div>
          </div>
          </div>
          <div className="bx--form-item">
            <div className="lhs-header">Properties</div>
          </div>
        </div>
      )}
      {currentRelationship !== undefined &&
        props.currentRelationshipType.attributes &&
        props.currentRelationshipType.attributes.map((item) => {
          return (
            <div className="bx--form-item" key={item.key}>
              <label htmlFor={updateLabelId(item.key)} className="bx--label">
                {item.label} <Info16 />
              </label>
              <input
                id={updateLabelId(item.key)}
                type="text"
                disabled={currentRelationship.readOnly}
                className="bx--text-input"
                defaultValue={currentRelationship[item.key]}
                key={currentRelationship[item.key]}
                onChange={(e) => setAttribute(item, e.target.value)}
                placeholder={item.label}
              ></input>
            </div>
          );
        })}
      {currentRelationship !== undefined && (
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
      {currentRelationship && currentRelationship.readOnly === false && (
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
