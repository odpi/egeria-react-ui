/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect, useContext } from "react";
import { IdentificationContext } from "../../../../contexts/IdentificationContext";
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
import DateTimePicker from "../../../common/DateTimePicker";
import Info16 from "@carbon/icons-react/lib/information/16";
import getRelationshipType from "../properties/RelationshipTypes";
import { issueRestCreate } from "../RestCaller";
import { useHistory } from "react-router-dom";
import { getGovernanceClassification } from "../properties/GovernanceClassifications";
import RequiredMessage from "../RequiredMessage";

/**
 * Component to show the create page for a node.
 *
 * @param props.currentNodeType This is the current NodeType. The NodeType is a structure detailing the attribute names and name of a Node.
 * @param props.glossaryGuid this is the glossary guid that is to be used to create the node under
 * @param props.parentCategoryGuid if specified this is the parent category underwhich to create the Node
 * @param props.onCreateCallback if specified this function is called when the create completes.
 * @param props.nodeToCreate if specified this contain attributes to prefill the create screen with
 * @returns
 */
export default function CreateNodePage(props) {
  const identificationContext = useContext(IdentificationContext);

  const [createBody, setCreateBody] = useState({});
  const [createdRelationship, setCreatedRelationship] = useState();
  const [createdNode, setCreatedNode] = useState();
  const [createdCompleteNode, setCreatedCompleteNode] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [restCallInProgress, setRestCallInProgress] = useState(false);
  const [currentAttributes, setCurrentAttributes] = useState();

  let history = useHistory();

  useEffect(() => {
    if (createdNode && createdRelationship && props.parentCategoryGuid) {
      // we need to wait for the relationship to be created before we can say that the node has been successfully created.
      creationTasksComplete(createdNode);
    } else if (createdNode) {
      // there is no relationship to create
      creationTasksComplete(createdNode);
    }
  }, [createdNode, createdRelationship, props]);

  //nodeToCreate
  useEffect(() => {
    if (props.nodeToCreate) {
      setCreateBody(props.nodeToCreate);
    }
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
          attributesWithValues.push(attributesWithValuesElement);
        }
        setCurrentAttributes(attributesWithValues);
      } else {
        setCurrentAttributes(attributes);
      }
    }
  }, [props]);

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
    let body = createBody;
    if (props.glossaryGuid) {
      let glossary = {};
      glossary.guid = props.glossaryGuid;
      body.glossary = glossary;
    }

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
      if (props.parentCategoryGuid) {
        // there is a parent category we need to knit to
        knitToParentCategory(node);
      }
      setCreatedNode(node);
    } else {
      onErrorGet("Error did not get a node from the server");
    }
  };
  const onSuccessfulParentRelationshipCreate = (json) => {
    setRestCallInProgress(false);
    console.log("onSuccessfulParentRelationshipCreate");
    if (json.result.length === 1) {
      const relationship = json.result[0];
      setCreatedRelationship(relationship);
    } else {
      onErrorGet("Error linking the created Node to it's category parent");
    }
  };
  const onClickFilledInForm = () => {
    if (props.onGotCreateDetails) {
      props.onGotCreateDetails(createBody);
    }
  };
  const onErrorParentRelationshipCreate = (msg) => {
    setRestCallInProgress(false);
    console.log("Error while attempting to create Relationship" + msg);
    setErrorMsg(msg);
    setCreatedCompleteNode(undefined);
  };
  const debugging = (itemkey) => {
    console.log("debug " + itemkey);
    return createBody[itemkey];
  };

  const knitToParentCategory = (node) => {
    const glossaryAuthorURL = identificationContext.getRestURL(
      "glossary-author"
    );
    let url;
    let body = {};
    let end1 = {};
    let end2 = {};
    end1.class = "Category";
    end1.nodeGuid = props.parentCategoryGuid;
    end1.nodeType = "Category";

    end2 = {};
    end2.nodeGuid = node.systemAttributes.guid;
    if (node.nodeType === "Term") {
      // create termcategorisation relationship
      url = getRelationshipType(glossaryAuthorURL, "categorization").url;
      body.relationshipType = "TermCategorization";
      body.class = "Categorization";
      end2.class = "Term";
      end2.nodeType = "Term";
    } else {
      // category create the category hierarchy relationship
      url = getRelationshipType(glossaryAuthorURL, "categoryhierarchylink").url;
      body.relationshipType = "CategoryHierarchyLink";
      body.class = "CategoryHierarchyLink";
      end2.class = "Category";
    }
    body.end1 = end1;
    body.end2 = end2;
    issueRestCreate(
      url,
      body,
      onSuccessfulParentRelationshipCreate,
      onErrorParentRelationshipCreate
    );
  };
  const creationTasksComplete = (node) => {
    setCreatedCompleteNode(node);
    if (props.onCreateCallback) {
      props.onCreateCallback();
    }
  };
  const onErrorNodeCreate = (msg) => {
    setRestCallInProgress(false);
    console.log("Error on Create " + msg);
    setErrorMsg(msg);
    setCreatedCompleteNode(undefined);
  };
  const validateForm = () => {
    //TODO consider marking name as manditory in the nodetype definition
    let isValid = false;
    if (createBody.name && createBody.name.length > 0) {
      isValid = true;
      // setErrorMsg("");
    } else {
      // setErrorMsg("Please specify a value for name");
    }

    return isValid;
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
  const onErrorGet = (msg) => {
    console.log("Error on Create " + msg);
    setCreatedNode(undefined);
    setCreatedRelationship(undefined);
    setErrorMsg(msg);
  };
  const createLabelIdForAttribute = (labelKey) => {
    return "text-input-create" + props.currentNodeType.name + "-" + labelKey;
  };
  const createLabelIdForSubmitButton = (labelKey) => {
    return props.currentNodeType.name + "CreateViewButton";
  };
  const setAttribute = (item, value) => {
    console.log("setAttribute " + item.key + ",value=" + value);
    let myCreateBody = createBody;
    myCreateBody[item.key] = value;
    setCreateBody(myCreateBody);
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

  const getCreatedTableTitle = () => {
    return "Successfully created " + createdCompleteNode.name;
  };

  const getCreatedTableAttrRowData = () => {
    let rowData = [];
    const attributes = props.currentNodeType.attributes;
    console.log();
    for (var prop in createdCompleteNode) {
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

        let value = createdCompleteNode[prop];
        // TODO deal with the other types (and null? and arrays?) properly
        value = JSON.stringify(value);
        row.value = value;
        rowData.push(row);
      }
    }
    return rowData;
  };
  const getSystemDataRowData = () => {
    let rowData = [];
    const systemAttributes = createdCompleteNode.systemAttributes;
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
  const getDateFormat = () => {
    return "m/d/Y";
  };
  const getDateFormatPlaceHolder = () => {
    return "mm/dd/yyyy";
  };

  const getGovernanceClassificationDataRowData = (classification) => {
    let rowData = [];
    const classificationAttributes = getGovernanceClassification(classification)
      .attributes;

    if (
      createdCompleteNode.governanceClassifications !== undefined &&
      createdCompleteNode.governanceClassifications[classification] !==
        undefined
    ) {
      const classificationFromServer =
        createdCompleteNode.governanceClassifications[classification];
      for (var i = 0; i < classificationAttributes.length; i++) {
        // only process the attribute if we know about it.
        const attributeKey = classificationAttributes[i].key;
        if (classificationFromServer[attributeKey] !== undefined) {
          const attributeValueFromServer =
            classificationFromServer[attributeKey];
          let row = {};
          row.id = attributeKey;
          row.attrName = classificationAttributes[i].label;
          // TODO deal with the other types (and null? and arrays?) properly
          row.value = JSON.stringify(attributeValueFromServer);
          console.log(
            "getGovernanceClassificationDataRowData " +
              classification +
              " " +
              row.value
          );
          rowData.push(row);
        }
      }
      // TODO "systemAttributes" of the classification
    }
    return rowData;
  };

  // const createAnother = () => {
  //   setCreatedCompleteNode(undefined);
  // };
  const onClickBack = () => {
    console.log("Back clicked");
    // use history, as there is another window history object in scope in the event listener
    console.log(history);
    // go  back
    history.goBack();
  };
  return (
    <div>
      {restCallInProgress && (
        <Loading
          description="Waiting for network call to the server to complete"
          withOverlay={true}
        />
      )}
      {!restCallInProgress && createdCompleteNode !== undefined && (
        <div>
          <DataTable
            isSortable
            rows={getCreatedTableAttrRowData()}
            headers={attributeTableHeaderData}
            render={({ rows, headers, getHeaderProps }) => (
              <TableContainer title={getCreatedTableTitle()}>
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
          <Accordion>
            <AccordionItem title="Confidentiality Governance Classification">
              <div className="bx--form-item">
                <DataTable
                  isSortable
                  rows={getGovernanceClassificationDataRowData(
                    "confidentiality"
                  )}
                  headers={attributeTableHeaderData}
                  render={({ rows, headers, getHeaderProps }) => (
                    <TableContainer title="Confidentiality">
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
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
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
          <Accordion>
            <AccordionItem title="Confidence Governance Classification">
              <div className="bx--form-item">
                <DataTable
                  isSortable
                  rows={getGovernanceClassificationDataRowData("confidence")}
                  headers={attributeTableHeaderData}
                  render={({ rows, headers, getHeaderProps }) => (
                    <TableContainer title="Confidence">
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
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
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
          <Accordion>
            <AccordionItem title="Criticality Governance Classification">
              <div className="bx--form-item">
                <DataTable
                  isSortable
                  rows={getGovernanceClassificationDataRowData("criticality")}
                  headers={attributeTableHeaderData}
                  render={({ rows, headers, getHeaderProps }) => (
                    <TableContainer title="Criticality">
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
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
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
          <Accordion>
            <AccordionItem title="Retention Governance Classification">
              <div className="bx--form-item">
                <DataTable
                  isSortable
                  rows={getGovernanceClassificationDataRowData("retention")}
                  headers={attributeTableHeaderData}
                  render={({ rows, headers, getHeaderProps }) => (
                    <TableContainer title="Retention">
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
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
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
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
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
          {!props.onCreateCallback && (
            <button
              kind="secondary"
              className="bx--btn bx--btn--primary"
              onClick={onClickBack}
              type="button"
            >
              Back
            </button>
          )}
          {props.onCreateCallback && (
            <button
              className="bx--btn bx--btn--primary"
              onClick={onClickBack}
              type="button"
            >
              Finished
            </button>
          )}
        </div>
      )}

      {!restCallInProgress && createdCompleteNode === undefined && (
        <div>
          <form>
            <div>
              <h4>
                Create{" "}
                {props.currentNodeType ? props.currentNodeType.typeName : ""}
                <Info16 />
              </h4>
            </div>

            {props.currentNodeType &&
              createdCompleteNode === undefined &&
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
                      {/* <RequiredMessage required={item.required} value={createBody[item.key]}></RequiredMessage>
                       */}
                      {/* {isInValidItem(item) ? (
                        <span style={{ color: "red" }}>
                          Required
                        </span>
                      ) : (
                        ""
                      )} */}
                    </div>
                  );
                })}
            <Accordion>
              <AccordionItem title="Effectivity">
                <DateTimePicker
                  dateLabel="Effective from date"
                  timeLabel="Effective from time"
                />
                <DateTimePicker
                  dateLabel="Effective to date"
                  timeLabel="Effective to time"
                />
              </AccordionItem>
            </Accordion>
            <div style={{ color: "red" }}>{errorMsg}</div>
            {!props.onGotCreateDetails && (
              <div className="flex-row-container">
                <div className="bx--form-item">
                  <button
                    className="bx--btn bx--btn--primary"
                    disabled={!validateForm()}
                    onClick={onClickToCreate}
                    onAnimationEnd={handleOnAnimationEnd}
                    type="button"
                  >
                    Create
                  </button>
                </div>
                <div className="bx--form-item">
                  <button
                    className="bx--btn--tertiary"
                    kind="secondary"
                    onClick={onClickBack}
                    type="button"
                  >
                    Cancel create
                  </button>
                </div>
              </div>
            )}
            {props.onGotCreateDetails && (
              <div className="bx--form-item">
                <button
                  className="bx--btn bx--btn--primary"
                  onClick={onClickFilledInForm}
                  onAnimationEnd={handleOnAnimationEnd}
                  type="button"
                >
                  Use these values
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
