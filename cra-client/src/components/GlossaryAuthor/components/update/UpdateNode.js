/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useContext, useEffect } from "react";
import getPathTypesAndGuids from "../properties/PathAnalyser";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import getNodeType from "../properties/NodeTypes.js";
import UpdateNodePropertiesWizard from "./UpdateNodePropertiesWizard";
import {
  Accordion,
  AccordionItem,
  Button,
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
import { issueRestUpdate, issueRestGet } from "../../../common/RestCaller";
import { useHistory } from "react-router-dom";

export default function UpdateNode(props) {
  const identificationContext = useContext(IdentificationContext);
  const [nodeType, setNodeType] = useState();
  const [guidToEdit, setGuidToEdit] = useState();
  const [relationshipsFromServer, setRelationshipsFromServer] = useState();
  const [relationshipsMap, setRelationshipsMap] = useState();
  console.log("UpdateNode");

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

  useEffect(() => {
    if (relationshipsFromServer) {
      let newRelationshipsMap = {};
      if (relationshipsMap !== undefined) {
        newRelationshipsMap = relationshipsMap;
      }
      for (var i = 0; i < relationshipsFromServer.length; i++) {
        const serverRelationship = relationshipsFromServer[i];
        const name = serverRelationship.name;
        let relationshipTypeArray = [];
        if (name in newRelationshipsMap) {
          // if we already have this property, pick up the existing relationships
          relationshipTypeArray = newRelationshipsMap[name];
        }
        if (relationshipTypeArray === undefined) {
          relationshipTypeArray = [];
        }
        // calculate a data representation of the relationship that can be displayed in a table row
        let relationshipRow = {};
        for (var prop in serverRelationship) {
          if (prop === "end1") {
            const end1 = serverRelationship[prop];
            relationshipRow["end1name"] = end1.name;
            relationshipRow["end1guid"] = end1.nodeGuid;
            relationshipRow["end1qualifiedname"] = end1.nodeQualifiedName;
            relationshipRow["end1description"] = end1.description;
          } else if (prop === "end2") {
            const end2 = serverRelationship[prop];
            relationshipRow["end2name"] = end2.name;
            relationshipRow["end2guid"] = end2.nodeGuid;
            relationshipRow["end2qualifiedname"] = end2.nodeQualifiedName;
            relationshipRow["end2description"] = end2.description;
          } else if (prop === "systemAttributes") {
            const systemAttributes = serverRelationship[prop];
            relationshipRow["createdBy"] = systemAttributes.createdBy;
            relationshipRow["version"] = systemAttributes.version;
            relationshipRow["createTime"] = systemAttributes.createTime;
          } else {
            relationshipRow[prop] = serverRelationship[prop];
          }
        }
        relationshipRow.key = serverRelationship.guid;
        relationshipTypeArray.push(relationshipRow);
        newRelationshipsMap[name] = relationshipTypeArray;
      }
      setRelationshipsMap(newRelationshipsMap);
    }
  }, [relationshipsFromServer]);

  const [updateBody, setUpdateBody] = useState({});
  const [currentNode, setCurrentNode] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [relationshipOffset, setRelationshipOffset] = useState(0);
  console.log("UpdateNode");
  let history = useHistory();
  // big enough to get one of each relationship type, if they exist
  const relationshipPageSize = 30;

  const initialGet = () => {
    issueRestGet(getUrl(), onSuccessfulGet, onErrorGet);
    return "Getting details";
  };
  function getUrl() {
    return nodeType.url + "/" + guidToEdit;
  }
  const isDisabled = () => {
    let isDisabled = false;
    if (currentNode && currentNode.readOnly) {
      isDisabled = true;
    }
    return isDisabled;
  };

  const handleShowRelationships = () => {
    let url =
      getUrl() +
      "/relationships?pagesize=" +
      relationshipPageSize +
      "&offset=" +
      relationshipOffset;
    issueRestGet(url, onSuccessfulGetRelationships, onErrorGetRelationships);
    setRelationshipOffset(relationshipOffset + relationshipPageSize);
  };

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
  const onSuccessfulGetRelationships = (json) => {
    console.log("onSuccessfulGetRelationships");
    if (json.result) {
      console.log("get relationships " + JSON.stringify(json.result));
      setRelationshipsFromServer(json.result);
    } else {
      onErrorGet("Error did not get relationships from the server");
    }
  };
  const onErrorGetRelationships = (msg) => {
    console.log("Error on Get Relationships" + msg);
    setErrorMsg(msg);
    // setCurrentNode(undefined);
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
  const systemDataHeaders = [
    {
      header: "Attribute Name",
      key: "attrName",
    },
    {
      header: "Value",
      key: "value",
    },
  ];
  const relationshipHeaders = [
    {
      header: "Name",
      key: "name",
    },
    {
      header: "GUID",
      key: "guid",
    },
    {
      header: "Read Only",
      key: "readOnly",
    },
    {
      header: "Created by",
      key: "createdBy",
    },
    {
      header: "Create Time",
      key: "createTime",
    },
    {
      header: "Update Time",
      key: "updateTime",
    },
    {
      header: "Version",
      key: "version",
    },
    {
      header: "End 1 qualified name",
      key: "end1qualifiedname",
    },
    {
      header: "End 1 name",
      key: "end1name",
    },
    {
      header: "End 1 description",
      key: "end1description",
    },
    {
      header: "End 1 GUID",
      key: "end1guid",
    },
    {
      header: "End2 qualified name",
      key: "end2qualifiedname",
    },
    {
      header: "End 2 name",
      key: "end2name",
    },
    {
      header: "End 2 description",
      key: "end2description",
    },
    {
      header: "End 2 GUID",
      key: "end2guid",
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
  const getRelationshipRowData = (relationshipName) => {
    let rows = [];
    const relationshipKey = relationshipName.key;
    if (relationshipsMap && relationshipsMap[relationshipKey]) {
      rows = relationshipsMap[relationshipKey];
    }

    return rows;
  };
  const renderRelationships = () => {
    return Object.entries(relationshipsMap).map(([key], i) => {
      return (
        <Accordion>
          <AccordionItem title={key}>
            <div className="bx--form-item">
              <DataTable
                isSortable
                rows={getRelationshipRowData({ key })}
                headers={relationshipHeaders}
                render={({ rows, headers, getHeaderProps }) => (
                  <TableContainer title={key}>
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
      );
    });
  };

  const onClickBack = () => {
    console.log("Back clicked");
    // use history, as there is another window history object in scope in the event listener
    console.log(history);
    // go  back
    history.goBack();
  };
  // const onUpdated = (payLoad) => {
  //   setUpdateBody(payLoad);
  //   // if (payLoad.node !== undefined) {
  //   //   const nodeTypeName = payLoad.node.nodeType.toLowerCase();
  //   //   const nodeType = getNodeType(
  //   //     identificationContext.getRestURL("glossary-author"),
  //   //     nodeTypeName
  //   //   );
  //   //   instancesContext.updateNodeInstance(payLoad.node, nodeType);
  //   // }
  //   // if (payLoad.relationship !== undefined) {
  //   //   const relationshipTypeName =
  //   //     payLoad.relationship.relationshipType.toLowerCase();
  //   //   instancesContext.updateRelationshipInstance(
  //   //     payLoad.relationship,
  //   //     payLoad.relationship.relationshipTypeName
  //   //   );
  //   // }
  // };
  return (
    <div>
      {currentNode === undefined && nodeType && initialGet()}
      {currentNode !== undefined && (
        <UpdateNodePropertiesWizard
          onUpdated={setUpdateBody}
          // onModalContentRequestedClose={props.onModalContentRequestedClose}
          currentNode={currentNode}
        />
      )}
      {/*   )} 
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
      )} (*/}
      {currentNode !== undefined && (
        <Accordion>
          <AccordionItem title="System Attributes">
            <div className="bx--form-item">
              <DataTable
                isSortable
                rows={getSystemDataRowData()}
                headers={systemDataHeaders}
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
      )
      {currentNode !== undefined && (
        <Accordion>
          <AccordionItem title="Relationships">
            {relationshipsFromServer === undefined && (
              <Button
                className="bx--btn bx--btn--tertiary"
                onClick={handleShowRelationships}
                type="button"
              >
                Show Relationships
              </Button>
            )}
            {relationshipsFromServer !== undefined && (
              <div>
                <Button
                  className="bx--btn bx--btn--tertiary"
                  onClick={handleShowRelationships}
                  type="button"
                >
                  More Relationships
                </Button>
              </div>
            )}
            {relationshipsMap && <div> {renderRelationships()} </div>}
          </AccordionItem>
        </Accordion>
      )}
      <div style={{ color: "red" }}>{errorMsg}</div>
      <Button
        className="bx--btn bx--btn--primary"
        onClick={handleClickUpdate}
        disabled={isDisabled()}
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
