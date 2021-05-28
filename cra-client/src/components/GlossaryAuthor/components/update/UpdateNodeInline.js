/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { parse, format } from "date-fns";
import {
  Accordion,
  AccordionItem,
  Button,
  DataTable,
  Modal,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "carbon-components-react";
// import Info16 from "@carbon/icons-react/lib/information/16";

import { InstancesContext } from "../visualisation/contexts/InstancesContext";
import {
  validatePropertiesUserInput,
  extendUserInput,
} from "../../../common/Validators";
import { issueRestUpdate } from "../RestCaller";
import NodeInput from "../authoringforms/NodeInput";
import CreateRelationshipWizard from "../create/CreateRelationshipWizard";

export default function UpdateNodeInline(props) {
  const instancesContext        = useContext(InstancesContext);
  const [currentNode, setCurrentNode] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [userInput, setUserInput] = useState();
  const [primaryButtonDisabled, setPrimaryButtonDisabled] = useState(true);

  useEffect(() => {
    setCurrentNode(props.node);
    updateUserInputFromNode(props.node);
  }, [props]);
  /**
   * There is new node content (from an update response or we are initialising with content). The node is the serialised for of a glossary author artifact, used on rest calls.
   * The userInput state variable stores data in a format that the user interface needs, including a value and invalid flag
   * for each attrribute value.
   * This function maps the node content to the userInput.
   * @param {*} node
   */
  const updateUserInputFromNode = (node) => {
    const currentNodeType = props.currentNodeType;
    let newUserInput = {};
    if (
      currentNodeType &&
      currentNodeType.attributes &&
      currentNodeType.attributes.length > 0
    ) {
      for (let i = 0; i < currentNodeType.attributes.length; i++) {
        const attributeName = currentNodeType.attributes[i].key;
        newUserInput[attributeName] = {};
        newUserInput[attributeName].value = node[attributeName];
        newUserInput[attributeName].invalid = false;
      }
    }

    // change the dates from longs to an object with a date and time
    if (node.effectiveFromTime) {
      let dateTimeObject = {};
      dateTimeObject.date = {};
      dateTimeObject.date.value = new Date(node.effectiveFromTime);
      dateTimeObject.date.invalid = false;
      dateTimeObject.time = {};
      dateTimeObject.time.value = format(node.effectiveFromTime, "HH:mm");
      dateTimeObject.time.invalid = false;
      newUserInput.effectiveFromTime = dateTimeObject;
    }
    if (node.effectiveToTime) {
      let dateTimeObject = {};
      dateTimeObject.date = {};
      dateTimeObject.date.value = new Date(node.effectiveToTime);
      dateTimeObject.date.invalid = false;
      dateTimeObject.time = {};
      dateTimeObject.time.value = format(node.effectiveToTime, "HH:mm");
      dateTimeObject.time.invalid = false;
      newUserInput.effectiveToTime = dateTimeObject;
    }
    setUserInput(newUserInput);
  };
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
    let body = currentNode;

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
      updateUserInputFromNode(node);
    } else {
      setErrorMsg("Error did not get a node from the server");
      setCurrentNode(undefined);
    }
  };
  const onErrorUpdate = (msg) => {
    console.log("Error on Update " + msg);
    setErrorMsg(msg);
    setCurrentNode(undefined);
    updateUserInputFromNode(undefined);
  };
  const createRelationship = () => {};

  const onAttributeChange = (attributeKey, attributeValue) => {
    const extendedUserInput = extendUserInput(
      userInput,
      attributeKey,
      attributeValue
    );

    let newUserInput = {
      ...extendedUserInput,
    };

    setUserInput(newUserInput);
    if (validatePropertiesUserInput(extendedUserInput)) {
      if (
        attributeKey === "effectiveFromTime" ||
        attributeKey === "effectiveToTime"
      ) {
        // the value is an object with date and time properties
        // we need to create a single date
        if (attributeValue !== undefined) {
          let time = attributeValue.time;
          let date = attributeValue.date;
          if (time === undefined) {
            attributeValue = date;
          } else {
            attributeValue = parse(time, "HH:mm", date);
          }
          attributeValue = attributeValue.getTime();
        }
      }
      let myCurrentNode = {
        ...currentNode,
        [attributeKey]: attributeValue,
      };
      setCurrentNode(myCurrentNode);
    }
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

  const onRelationshipCreated = (payLoad) => {
    instancesContext.addRelationshipInstance( payLoad.node, payLoad.relationship);
  };
  const onReadyToCreate = () => {
    setPrimaryButtonDisabled(false);
  };

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
  const ModalStateManager = ({
    renderLauncher: LauncherContent,
    children: ModalContent,
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        {!ModalContent || typeof document === "undefined"
          ? null
          : ReactDOM.createPortal(
              <ModalContent open={open} setOpen={setOpen} />,
              document.body
            )}
        {LauncherContent && <LauncherContent open={open} setOpen={setOpen} />}
      </>
    );
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
        props.currentNodeType !== undefined &&
        props.currentNodeType.attributes !== undefined && (
          <NodeInput
            currentNodeType={props.currentNodeType}
            onAttributeChange={onAttributeChange}
            operation="Update"
            inputNode={userInput}
          />
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
      {currentNode && currentNode.nodeType === "Term" && (
        <ModalStateManager
          renderLauncher={({ setOpen }) => (
            <Button onClick={() => setOpen(true)}>Create Relationship</Button>
          )}
        >
          {({ open, setOpen }) => (
            <Modal
              modalHeading="Create Relationship"
              open={open}
              passiveModal={true}
              onRequestClose={() => setOpen(false)}
            >
              <CreateRelationshipWizard
                currentNodeType={props.currentNodeType}
                currentNode={currentNode}
                onCreated={onRelationshipCreated}
                onReadyToCreate={onReadyToCreate}
                onModalContentRequestedClose={() => setOpen(false)}
              />
            </Modal>
          )}
        </ModalStateManager>
      )}
    </div>
  );
}
