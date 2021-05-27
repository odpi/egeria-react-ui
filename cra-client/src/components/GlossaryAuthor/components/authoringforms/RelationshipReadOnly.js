/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import format from "date-fns/format";
import {
  Accordion,
  AccordionItem,
  DataTable,
  Loading,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "carbon-components-react";
import { issueRestCreate } from "../RestCaller";
import { issueRestUpdate } from "../RestCaller";


/**
 * Component to show the page for a relationship that is about to be created or updated
 *
 * @param props.currentRelationshipType This is the current RelationshipType. The RelationshipType is a structure detailing the attribute names.
 * @param props.inputRelationship if specified this contain attributes to prefill the screen with prior to issuing the rest call.
 * @param operation Create or Update
 * @returns
 */
export default function RelationshipReadOnly(props) {
  // const identificationContext = useContext(IdentificationContext);

  const [restCallInProgress, setRestCallInProgress] = useState(false);
  // After the rest call succeeds, the response from the create is in this state
  const [resultantRelationship, setResultantRelationship] = useState();

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

  const getTableAttrRowData = () => {
    console.log("getTableAttrRowData");
    let relationship = props.inputRelationship;
    if (resultantRelationship !== undefined) {
      relationship = resultantRelationship;
    }
    let rowData = [];
    if (props.currentRelationshipType) {
      const attributes = props.currentRelationshipType.attributes;
      console.log();
      for (var prop in relationship) {
        if (
          prop !== "systemAttributes" &&
          // prop !== "glossary" &&
          prop !== "classifications" &&
          prop !== "class" &&
          prop !== "governanceClassifications" &&
          prop !== "confidence" &&
          prop !== "confidentiality" &&
          prop !== "criticality" &&
          prop !== "retention"
        ) {
          let row = {};
          row.id = prop;
          row.attrName = prop;
          // if we know about the attribute then use the label.
          if (prop === "relationshipType") {
            row.attrName = "Relationship Type";
          } else if (prop === "effectiveFromTime") {
            row.attrName = "Effective from time";
          } else if (prop === "effectiveToTime") {
            row.attrName = "Effective until time ";
          } else {
            for (var i = 0; i < attributes.length; i++) {
              if (attributes[i].key === prop) {
                row.attrName = attributes[i].label;
              }
            }
          }

          let value = relationship[prop];
          // TODO deal with the other types (and null? and arrays?) properly
          if (value !== undefined) {
            if (prop === "effectiveFromTime" || prop === "effectiveToTime") {
              value = format(new Date(value), "PPPPpppp");
            } else {
              value = JSON.stringify(value);
            }
          }
          row.value = value;
          rowData.push(row);
        }
      }
    }
    return rowData;
  };
  const getSystemDataRowData = () => {
    let rowData = [];
    if (resultantRelationship !== undefined) {
      const systemAttributes = resultantRelationship.systemAttributes;
      for (var prop in systemAttributes) {
        let row = {};
        row.id = prop;
        row.attrName = prop;
        let value = systemAttributes[prop];
        if (prop === "createTime" || prop === "updateTime") {
          if (value != undefined) {
            value = format(value, "PPPPpppp");
          }
          // } else {
          //   value = JSON.stringify(value);
        }

        // TODO deal with the other types (and null? and arrays?) properly
        value = JSON.stringify(value);
        row.value = value;
        rowData.push(row);
      }
    }
    return rowData;
  };

  /**
   * If there was an error the button has a class added to it to cause it to shake. After the animation ends, we need to remove the class.
   * @param {*} e end anomation event
   */
  const handleOnAnimationEnd = (e) => {
    document
      .getElementById(labelIdForSubmitButton())
      .classList.remove("shaker");
  };
  const onClickToIssueRest = (e) => {
    console.log("onClickToIssueRest()");
    e.preventDefault();
    setRestCallInProgress(true);
    const relationshipTypeName = props.currentRelationshipType.name;

    const body = {
      ...props.inputRelationship,
      ["relationshipType"]: relationshipTypeName,
    };

    // TODO consider moving this up to a relationship controller as per the CRUD pattern.
    // in the meantime this will be self contained.
    const url = props.currentRelationshipType.url;
    if (props.operation === "Create") {
      console.log("issueCreate " + url);
      issueRestCreate(url, body, onSuccessfulRestCall, onErrorRestCall);
    } else {
      console.log("issueUpdate " + url);
      issueRestUpdate(url, body, onSuccessfulRestCall, onErrorRestCall);
    }
  };
  const onSuccessfulRestCall = (json) => {
    setRestCallInProgress(false);

    console.log("onSuccessfulRestCall");
    if (json.result.length === 1) {
      const relationship = json.result[0];
      setResultantRelationship(relationship);
      props.onComplete(relationship);
    } else {
      onErrorGet("Error did not get a relationship from the server");
    }
  };
  const onErrorRestCall = (msg) => {
    setRestCallInProgress(false);
    console.log("Error on " + props.operation + " " + msg);
    // setErrorMsg(msg);
  };
  const onErrorGet = (msg) => {
    console.log("Error on " + props.operation + " " + msg);
    setResultantRelationship(undefined);
    // setCreatedRelationship(undefined);
    // setErrorMsg(msg);
  };
  const labelIdForSubmitButton = (labelKey) => {
    return props.currentRelationshipType.name + "ViewButton";
  };

  return (
    <div>
      {restCallInProgress && (
        <Loading
          description="Waiting for network call to the server to complete"
          withOverlay={true}
        />
      )}
      {restCallInProgress === false && (
        <DataTable
          isSortable
          rows={getTableAttrRowData()}
          headers={attributeTableHeaderData}
          render={({ rows, headers, getHeaderProps }) => (
            <TableContainer>
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
      )}
      {getSystemDataRowData() !== [] && (
        <Accordion>
          <AccordionItem title="System Attributes">
            <div className="bx--form-item">
              <DataTable
                isSortable
                rows={getSystemDataRowData()}
                headers={attributeTableHeaderData}
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
      {resultantRelationship === undefined && (
        <div className="flex-row-container">
          <div className="bx--form-item">
            <button
              className="bx--btn bx--btn--primary"
              onClick={onClickToIssueRest}
              onAnimationEnd={handleOnAnimationEnd}
              type="button"
            >
              {props.operation}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
