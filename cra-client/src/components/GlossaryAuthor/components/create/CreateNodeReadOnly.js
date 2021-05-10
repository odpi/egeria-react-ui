/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
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

/**
 * Component to show the create page for a node.
 *
 * @param props.currentNodeType This is the current NodeType. The NodeType is a structure detailing the attribute names and name of a Node.
 * @param props.nodeToCreate if specified this contain attributes to prefill the create screen with
 * @returns
 */
export default function CreateNodeReadOnly(props) {
  // const identificationContext = useContext(IdentificationContext);

  const [node, setNode] = useState({});
  const [errorMsg, setErrorMsg] = useState();
  const [restCallInProgress, setRestCallInProgress] = useState(false);
  // this is the node to create
  const [nodeToCreate, setNodeToCreate] = useState();
  // After the rest call succeeds, the response from the create is in this state
  const [createdNode, setCreatedNode] = useState();

  // useEffect(() => {
  //   setNodeToCreate(props.nodeToCreate);
  // }, [props]);

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
    let node = props.nodeToCreate;
    if (createdNode !== undefined) {
      node = createdNode;
    }
    let rowData = [];
    if (props.currentNodeType) {
      const attributes = props.currentNodeType.attributes;
      console.log();
      for (var prop in node) {
        if (
          prop !== "systemAttributes" &&
          prop !== "glossary" &&
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
          if (prop === "nodeType") {
            row.attrName = "Node Type";
          } else {
            for (var i = 0; i < attributes.length; i++) {
              if (attributes[i].key === prop) {
                row.attrName = attributes[i].label;
              }
            }
          }

          let value = node[prop];
          // TODO deal with the other types (and null? and arrays?) properly
          value = JSON.stringify(value);
          row.value = value;
          rowData.push(row);
        }
      }
    }
    return rowData;
  };
  const getSystemDataRowData = () => {
    let rowData = [];
    if (createdNode !== undefined) {
      const systemAttributes = createdNode.systemAttributes;
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
    }
    return rowData;
  };

  /**
   * If there was an error the button has a class added to it to cause it to shake. After the animation ends, we need to remove the class.
   * @param {*} e end anomation event
   */
  const handleOnAnimationEnd = (e) => {
    document
      .getElementById(createLabelIdForSubmitButton())
      .classList.remove("shaker");
  };
  const onClickToCreate = (e) => {
    console.log("CreateNodePage onClickToCreate(()");
    e.preventDefault();
    setRestCallInProgress(true);
    const nodeTypeName = props.currentNodeType.name;

    const body = {
      ...props.nodeToCreate,
      ["nodeType"]: nodeTypeName
    };

    // TODO consider moving this up to a node controller as per the CRUD pattern.
    // in the meantime this will be self contained.
    const url = props.currentNodeType.url;
    console.log("issueCreate " + url);
    issueRestCreate(url, body, onSuccessfulNodeCreate, onErrorNodeCreate);
  };
  const onSuccessfulNodeCreate = (json) => {
    setRestCallInProgress(false);

    console.log("onSuccessfulNodeCreate");
    if (json.result.length === 1) {
      const node = json.result[0];
      setCreatedNode(node);
      props.onCreate(node);
    } else {
      onErrorGet("Error did not get a node from the server");
    }
  };
  const onErrorNodeCreate = (msg) => {
    setRestCallInProgress(false);
    console.log("Error on Create " + msg);
    setErrorMsg(msg);
  };
  const onErrorGet = (msg) => {
    console.log("Error on Create " + msg);
    setCreatedNode(undefined);
    // setCreatedRelationship(undefined);
    setErrorMsg(msg);
  };
  const createLabelIdForSubmitButton = (labelKey) => {
    return props.currentNodeType.name + "CreateViewButton";
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
      <div style={{ color: "red" }}>{errorMsg}</div>
      {createdNode === undefined && (
        <div className="flex-row-container">
          <div className="bx--form-item">
            <button
              className="bx--btn bx--btn--primary"
              onClick={onClickToCreate}
              onAnimationEnd={handleOnAnimationEnd}
              type="button"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
