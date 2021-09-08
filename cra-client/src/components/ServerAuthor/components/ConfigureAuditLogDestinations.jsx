/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext, useState, useEffect } from "react";

import { IdentificationContext } from "../../../contexts/IdentificationContext";
import { ServerAuthorContext } from "../contexts/ServerAuthorContext";
import auditLogDestinations from "./defaults/auditLogDestinations";
import { issueRestCreate, issueRestDelete, issueRestUpdate } from "../../common/RestCaller";
import {
  Column,
  Grid,
  Row,
  Select,
  SelectItem,
  TextInput,
  Button,
  Checkbox,
  DataTable,
  OverflowMenu,
  OverflowMenuItem,
} from "carbon-components-react";
import { MisuseOutline16, Edit16, Copy16 } from "@carbon/icons-react";

export default function ConfigureAuditLogDestinations({
  previousAction,
  nextAction,
}) {
  const [currentDestinationName, setCurrentDestinationName] = useState();
  const [currentDestinationId, setCurrentDestinationId] = useState();
  const [currentDestinationTypeName, setCurrentDestinationTypeName] =
    useState();
  const [currentDestinationDescription, setCurrentDestinationDescription] =
    useState();
  const [currentSupportedSeverities, setCurrentSupportedSeverities] =
    useState();
  const [currentCustomConnectorClass, setCurrentCustomConnectorClass] =
    useState();

  const [operation, setOperation] = useState();
  // TODO populate from file.
  const [destinationTypeDescription, setDestinationTypeDescription] =
    useState();

  const {
    supportedAuditLogSeverities,
    currentServerAuditDestinations,
    setCurrentServerAuditDestinations,
    newServerName,
    fetchServerConfig,
    setLoadingText,
  } = useContext(ServerAuthorContext);
  const { userId, serverName: tenantId } = useContext(IdentificationContext);

  const headers = [
    {
      key: "name",
      header: "Audit Log Destination Name",
    },
    {
      key: "description",
      header: "Audit Log Destination Description",
    },
    {
      key: "type",
      header: "Audit Log Destination Type",
    },
  ];
  /**
   * Every time we come in initialize the currently supported severities if required.
   */
  useEffect(() => {
    if (
      currentSupportedSeverities === undefined ||
      currentSupportedSeverities.length === 0
    ) {
      const checkedSupportedSeverities = supportedAuditLogSeverities.map(
        (s) => {
          return {
            ...s,
            selected: true,
          };
        }
      );
      setCurrentSupportedSeverities(checkedSupportedSeverities);
    }
  });

  if (!previousAction || !nextAction) {
    throw new Error(
      "ConfigureAuditLog component requires both a previousAction and a nextAction property."
    );
  }
  const onChangeTypeSelected = (e) => {
    console.log("onChangeTypeSelected " + e.target.value);
    setCurrentDestinationTypeName(e.target.value);
  };
  const getConnectorProviderClass = () => {
    let connectorClass = currentCustomConnectorClass;

    if (currentDestinationTypeName !== "connection") {
      for (let i = 0; i < auditLogDestinations.length; i++) {
        const auditLogDestination = auditLogDestinations[i];
        if (auditLogDestination.id === currentDestinationTypeName) {
          connectorClass = auditLogDestination.connectorProviderClassName;
        }
      }
    }

    return connectorClass;
  };
  const getTypeFromConnectorProviderClass = (className) => {
    let type = "connection";
    for (let i = 0; i < auditLogDestinations.length; i++) {
      const auditLogDestination = auditLogDestinations[i];
      if (auditLogDestination.connectorProviderClassName === className) {
        type = auditLogDestination.id;
      }
    }
    return type;
  };

  const onClickAdd = () => {
    setCurrentDestinationName(undefined);
    setCurrentDestinationId(undefined);
    setCurrentDestinationDescription(undefined);
    setCurrentSupportedSeverities(undefined);
    setCurrentDestinationTypeName('default');

    setOperation("Add");
  };

  const onClickRemoveAll = () => {
    const deleteAllAuditLogDestinationURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/audit-log-destinations"
    );
    setLoadingText("Removing all audit log destinations ");
    issueRestDelete(
      deleteAllAuditLogDestinationURL,
      onSuccessfulRemoveAll,
      onErrorAuditLogDestination
    );
  };

  const onClickEditOverflow = (selectedRows) => () => {
    console.log("called onClickEditOverflow", { selectedRows });
    if (selectedRows.length === 1) {
      editAction(selectedRows[0].id);
    }
  };
  const onClickCopyOverflow = (selectedRows) => () => {
    console.log("called onClickCopyOverflow", { selectedRows });
    if (selectedRows.length === 1) {
      editAction(selectedRows[0].id, true);
    }
  };

  const onClickDeleteOverflow = (selectedRows) => () => {
    console.log("called onClickDeleteOverflow", { selectedRows });
    if (selectedRows.length === 1) {
      deleteAction(selectedRows[0].id);
    }
  };

  const onClickDeleteBatchAction = (selectedRows) => {
    console.log("called onClickDeleteBatchAction", { selectedRows });
    if (selectedRows.length === 1) {
      deleteAction(selectedRows[0].id);
    }
  };

  const onClickCopyBatchAction = (selectedRows) => {
    console.log("called onClickCopyBatchAction", { selectedRows });
    if (selectedRows.length === 1) {
      editAction(selectedRows[0].id, true);
    }
  };

  const onClickEditBatchAction = (selectedRows) => {
    console.log("called onClickEditBatchAction", { selectedRows });
    if (selectedRows.length === 1) {
      editAction(selectedRows[0].id);
    }
  };

  const deleteAction = (name) => {
    const deleteAuditLogDestinationURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/audit-log-destinations/connection/" +
        name
    );

    issueRestDelete(
      deleteAuditLogDestinationURL,
      onSuccessfulRemove,
      onErrorAuditLogDestination
    );
  };

  const editAction = (id, isCopy) => {
    let auditLogDestinationToEdit;
    for (let i = 0; i < currentServerAuditDestinations.length; i++) {
      if (currentServerAuditDestinations[i].id === id) {
        auditLogDestinationToEdit = currentServerAuditDestinations[i];
      }
    }
    if (auditLogDestinationToEdit) {
      let destinationName = undefined;
      if (!isCopy) {
        destinationName = auditLogDestinationToEdit.name;
      }
      //we need to store the original name as this is the key that will be updated in the rest call.
      setCurrentDestinationId(destinationName);
      //the name could change in the editor
      setCurrentDestinationName(destinationName);
      setCurrentDestinationDescription(auditLogDestinationToEdit.description);
      setCurrentSupportedSeverities(auditLogDestinationToEdit.severities);
      setCurrentDestinationTypeName(auditLogDestinationToEdit.type);

      let op = "Edit";
      if (isCopy) {
        op = "Copy";
      }
      setOperation(op);
    } else {
      alert("unable to find name " + name);
    }
  
  };

  const onClickFinishedOperation = () => {
    if (operation === "Add" || operation === "Copy") {
       issueAdd();
    } else if (operation === "Edit") {
       issueEdit();
    } 
  };
  const issueAdd = () => {
    let nameExists = false;
    for (let i = 0; i < currentServerAuditDestinations.length; i++) {
      if (currentServerAuditDestinations[i].name === currentDestinationName) {
        nameExists = true;
      }
    }
    if (nameExists) {
      alert(
        "The requested Audit Log Destination Name '" +
          currentDestinationName +
          "' already exists. Please choose different one."
      );
    } else if (!currentDestinationName) {
      alert(
        "The requested Audit Log Destination Name need to have a value. Please specify one."
      );
    } else {
      setOperation(undefined);

      const addAuditLogDestinationURL = encodeURI(
        "/servers/" +
          tenantId +
          "/server-author/users/" +
          userId +
          "/servers/" +
          newServerName +
          "/audit-log-destinations/connection"
      );
      const body = {
        class: "Connection",
        headerVersion: 0,
        displayName: currentDestinationName,
        description: currentDestinationDescription,
        connectorType: {
          class: "ConnectorType",
          headerVersion: 0,
          type: {
            class: "ElementType",
            headerVersion: 0,
            elementOrigin: "LOCAL_COHORT",
            elementVersion: 0,
            elementTypeId: "954421eb-33a6-462d-a8ca-b5709a1bd0d4",
            elementTypeName: "ConnectorType",
            elementTypeVersion: 1,
            elementTypeDescription:
              "A set of properties describing a type of connector.",
          },
          guid: "4afac741-3dcc-4c60-a4ca-a6dede994e3f",
          qualifiedName: "Console Audit Log Store Connector",
          displayName: "Console Audit Log Store Connector",
          description:
            "Connector supports logging of audit log messages to stdout.",
          connectorProviderClassName: getConnectorProviderClass(),
        },
        configurationProperties: {
          supportedSeverities: currentSupportedSeverities,
        },
      };
      console.log("addAuditLogDestinationURL " + addAuditLogDestinationURL);
      setLoadingText("Adding audit log destination");
      issueRestCreate(
        addAuditLogDestinationURL,
        body,
        onSuccessfulAddAuditLogDestination,
        onErrorAuditLogDestination,
        "omagServerConfig"
      );
    }
  };
  const issueEdit = () => {
    setOperation(undefined);

    const editAuditLogDestinationURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/audit-log-destinations/connection/" + 
        currentDestinationId
    );
    const body = {
      class: "Connection",
      headerVersion: 0,
      displayName: currentDestinationName,
      description: currentDestinationDescription,
      connectorType: {
        class: "ConnectorType",
        headerVersion: 0,
        type: {
          class: "ElementType",
          headerVersion: 0,
          elementOrigin: "LOCAL_COHORT",
          elementVersion: 0,
          elementTypeId: "954421eb-33a6-462d-a8ca-b5709a1bd0d4",
          elementTypeName: "ConnectorType",
          elementTypeVersion: 1,
          elementTypeDescription:
            "A set of properties describing a type of connector.",
        },
        guid: "4afac741-3dcc-4c60-a4ca-a6dede994e3f",
        qualifiedName: "Console Audit Log Store Connector",
        displayName: "Console Audit Log Store Connector",
        description:
          "Connector supports logging of audit log messages to stdout.",
        connectorProviderClassName: getConnectorProviderClass(),
      },
      configurationProperties: {
        supportedSeverities: currentSupportedSeverities,
      },
    };
    console.log("editAuditLogDestinationURL " + editAuditLogDestinationURL);
    setLoadingText("Editing audit log destination");
    issueRestUpdate(
      editAuditLogDestinationURL,
      body,
      onSuccessfulEditAuditLogDestination,
      onErrorAuditLogDestination,
      "omagServerConfig"
    );
  };
  const onSuccessfulAddAuditLogDestination = () => {
    console.log("onSuccessfulAddAuditLogDestination entry");
    console.log(currentServerAuditDestinations);
    // let existingAuditLogDestinations = currentServerAuditDestinations;
    // const current = {
    //   id: currentDestinationName,
    //   // key: currentDestinationName,
    //   name: currentDestinationName,
    //   type: currentDestinationTypeName,
    //   severities: currentSupportedSeverities,
    //   description: currentDestinationDescription,
    // };
    // // clone the existing array
    // let newAuditLogDestinations = existingAuditLogDestinations.slice();
    // newAuditLogDestinations.push(current);
    // console.log("onSuccessfulAddAuditLogDestination exit");
    // console.log(newAuditLogDestinations);
    // setCurrentServerAuditDestinations(newAuditLogDestinations);
    document.getElementById("loading-container").style.display = "none";
    setLoadingText("Refreshing audit log destinations ");
    fetchServerConfig(refreshAuditLogDestinations, onErrorAuditLogDestination);
   
  };
  const onSuccessfulEditAuditLogDestination = () => {
    console.log("onSuccessfulEditAuditLogDestination ");
    console.log(currentServerAuditDestinations);
    document.getElementById("loading-container").style.display = "none";
    setLoadingText("Refreshing audit log destinations ");
    fetchServerConfig(refreshAuditLogDestinations, onErrorAuditLogDestination);
  };

  const onSuccessfulRemoveAll = () => {
    setCurrentServerAuditDestinations([]);
    document.getElementById("loading-container").style.display = "none";
  };

  const onSuccessfulRemove = (e) => {
    // update currentServerAuditDestinations
    console.log("onSuccessfulRemove");
    // Fetch Server Config
    setLoadingText("Refreshing audit log destinations ");
    fetchServerConfig(refreshAuditLogDestinations, onErrorAuditLogDestination);
  };

  const refreshAuditLogDestinations = (response) => {
    console.log("refreshAuditLogDestinations");
    console.log(response);

    const config = response.omagServerConfig;
    if (config) {
      const repositoryServicesConfig = config.repositoryServicesConfig;
      if (repositoryServicesConfig) {
        const auditLogConnections =
          repositoryServicesConfig.auditLogConnections;

        if (
          auditLogConnections === undefined ||
          auditLogConnections.length === 0
        ) {
          setCurrentServerAuditDestinations([]);
        } else {
          let refreshedAuditLogConnections = [];
          for (let i = 0; i < auditLogConnections.length; i++) {
            let refreshedAuditLogConnection = {};
            const auditLogConnection = auditLogConnections[i];
            refreshedAuditLogConnection.id = auditLogConnection.displayName;
            refreshedAuditLogConnection.name = auditLogConnection.displayName;
            refreshedAuditLogConnection.description =
              auditLogConnection.description;
            if (
              auditLogConnection.connectorType &&
              auditLogConnection.connectorType.connectorProviderClassName
            ) {
              refreshedAuditLogConnection.type =
                getTypeFromConnectorProviderClass(
                  auditLogConnection.connectorType.connectorProviderClassName
                );
            }

            refreshedAuditLogConnection.supportedSeverities = [];
            if (
              auditLogConnection.configurationProperties &&
              auditLogConnection.configurationProperties.supportedSeverities
            ) {
              refreshedAuditLogConnection.supportedSeverities =
                auditLogConnection.configurationProperties.supportedSeverities;
            }
            refreshedAuditLogConnections.push(refreshedAuditLogConnection);
          }

          setCurrentServerAuditDestinations(refreshedAuditLogConnections);
        }
      }
    }

    document.getElementById("loading-container").style.display = "none";
  };

  const onErrorAuditLogDestination = (err) => {
    console.log("onErrorAuditLogDestination");
    console.log(err);
    document.getElementById("loading-container").style.display = "none";
    alert("Error occurred configuring audit log destinations");
  };

  return (
    <div className="left-text">
       {operation === "Add" && (
         <h4>Add Audit Log Destination</h4>
       )}  
       {operation === "Edit" && (
         <h4>Edit Audit Log Destination</h4>
       )}  
       {operation === "Copy" && (
         <h4>Copy Audit Log Destination</h4>
       )}  

      {operation !== undefined && (
        <fieldset className="bx--fieldset left-text-bottom-margin-32">
          <TextInput
            id="new-destination-name"
            name="new-destination-name"
            type="text"
            labelText="Audit Log Destination Name"
            value={currentDestinationName}
            onChange={(e) => setCurrentDestinationName(e.target.value)}
            placeholder="my console"
            invalid={currentDestinationName === ""}
            style={{ marginBottom: "16px", width: "100%" }}
            autoComplete="off"
          />
          <TextInput
            id="new-destination-description"
            name="new-destination-description"
            type="text"
            labelText="Audit Log Destination Description"
            value={currentDestinationDescription}
            onChange={(e) => setCurrentDestinationDescription(e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
            autoComplete="off"
          />
          <Select
            defaultValue="placeholder-item"
            helperText={destinationTypeDescription}
            onChange={onChangeTypeSelected}
            id="select-server-type"
            invalidText="A valid value is required"
            labelText="Select Audit Log Destination Type"
          >
            {auditLogDestinations.map((dest, i) => (
              <SelectItem text={dest.label} value={dest.id} id={dest.id} />
            ))}
          </Select>
          {currentDestinationTypeName === "connection" && (
            <TextInput
              id="new-connector-class-name"
              name="new-connector-class-name"
              type="text"
              labelText="Connector Provider Class Name"
              value={currentCustomConnectorClass}
              invalid={currentCustomConnectorClass === ""}
              onChange={(e) => setCurrentCustomConnectorClass(e.target.value)}
              style={{ marginBottom: "16px", width: "100%" }}
              autoComplete="off"
            />
          )}

          <div className="bx--form-item">
            <label
              for="supported-severities-checkboxes"
              class="bx--label left-text-bottom-margin-32"
            >
              Select Audit Log Destination Supported Severities
            </label>
            <div
              className="left-text-bottom-margin-32"
              id="supported-severities-checkboxes"
              style={{ display: "flex" }}
            >
              {currentSupportedSeverities &&
                currentSupportedSeverities.map((severity, j) => (
                  <Checkbox
                    key={`audit-log-severity-${j}`}
                    labelText={severity.label}
                    id={severity.id}
                    checked={severity.selected}
                  />
                ))}
            </div>
          </div>

          <button onClick={(e) => onClickFinishedOperation()}>
            Enable this Audit Log Destination
          </button>
        </fieldset>
      )}
      {operation === undefined && (
        <Grid>
          <Row id="audit-log-destinations-list-container">
            <Column
              id="audit-log-destinations-list"
              sm={{ span: 8 }}
              md={{ span: 8 }}
              lg={{ span: 16 }}
            >
              <div className="left-text">
                {currentServerAuditDestinations && (
                  <DataTable
                    rows={currentServerAuditDestinations}
                    headers={headers}
                    isSortable
                  >
                    {({
                      rows,
                      headers,
                      getHeaderProps,
                      getRowProps,
                      getSelectionProps,
                      getToolbarProps,
                      getBatchActionProps,
                      onInputChange,
                      selectedRows,
                      getTableProps,
                      getTableContainerProps,
                    }) => (
                      <DataTable.TableContainer
                        title="Configure Audit log destinations"
                        description="List of all of the configured Audit log destinations"
                        {...getTableContainerProps()}
                      >
                        <DataTable.TableToolbar {...getToolbarProps()}>
                          <DataTable.TableBatchActions
                            {...getBatchActionProps()}
                          >
                            {selectedRows.length === 1 && (
                              <DataTable.TableBatchAction
                                tabIndex={
                                  getBatchActionProps().shouldShowBatchActions
                                    ? 0
                                    : -1
                                }
                                renderIcon={Edit16}
                                onClick={() => {
                                  onClickEditBatchAction(selectedRows);
                                }}
                              >
                                Edit
                              </DataTable.TableBatchAction>
                            )}
                            {selectedRows.length === 1 && (
                              <DataTable.TableBatchAction
                                tabIndex={
                                  getBatchActionProps().shouldShowBatchActions
                                    ? 0
                                    : -1
                                }
                                onClick={() => {
                                  onClickCopyBatchAction(selectedRows);
                                }}
                                renderIcon={Copy16}
                              >
                                Copy
                              </DataTable.TableBatchAction>
                            )}
                            <DataTable.TableBatchAction
                              tabIndex={
                                getBatchActionProps().shouldShowBatchActions
                                  ? 0
                                  : -1
                              }
                              renderIcon={MisuseOutline16}
                              onClick={() => {
                                onClickDeleteBatchAction(selectedRows);
                              }}
                            >
                              Delete
                            </DataTable.TableBatchAction>
                          </DataTable.TableBatchActions>
                          <DataTable.TableToolbarContent>
                            <DataTable.TableToolbarSearch
                              id="known-auditlog-destination-search"
                              onChange={onInputChange}
                            />
                          </DataTable.TableToolbarContent>
                          <Button
                            tabIndex={
                              getBatchActionProps().shouldShowBatchActions
                                ? -1
                                : 0
                            }
                            style={{
                              display: getBatchActionProps()
                                .shouldShowBatchActions
                                ? "none"
                                : "inherit",
                            }}
                            onClick={onClickRemoveAll}
                            size="small"
                            kind="tertiary"
                          >
                            Remove All
                          </Button>
                          <Button
                            tabIndex={
                              getBatchActionProps().shouldShowBatchActions
                                ? -1
                                : 0
                            }
                            style={{
                              display: getBatchActionProps()
                                .shouldShowBatchActions
                                ? "none"
                                : "inherit",
                            }}
                            onClick={onClickAdd}
                            size="small"
                            kind="tertiary"
                          >
                            Create new
                          </Button>
                        </DataTable.TableToolbar>
                        <DataTable.Table {...getTableProps()}>
                          <DataTable.TableHead>
                            <DataTable.TableRow>
                              <DataTable.TableSelectAll
                                {...getSelectionProps()}
                              />
                              {headers.map((header, i) => (
                                <DataTable.TableHeader
                                  key={`defined-audit-destintions-header-${i}`}
                                  {...getHeaderProps({ header })}
                                >
                                  {header.header}
                                </DataTable.TableHeader>
                              ))}
                              <DataTable.TableHeader />
                            </DataTable.TableRow>
                          </DataTable.TableHead>
                          <DataTable.TableBody>
                            {rows.map((row, index) => (
                              <React.Fragment key={index}>
                                <DataTable.TableRow {...getRowProps({ row })}>
                                  <DataTable.TableSelectRow
                                    {...getSelectionProps({ row })}
                                  />
                                  {row.cells.map((cell) => {
                                    return (
                                      <DataTable.TableCell key={cell.id}>
                                        {cell.value}
                                      </DataTable.TableCell>
                                    );
                                  })}
                                  <DataTable.TableCell className="bx--table-column-menu">
                                    <OverflowMenu flipped>
                                      <OverflowMenuItem
                                        id="edit-audit-log-overflow"
                                        itemText="Edit"
                                        onClick={onClickEditOverflow([row])}
                                      />
                                      <OverflowMenuItem
                                        itemText="Copy"
                                        onClick={onClickCopyOverflow([row])}
                                      />
                                      <OverflowMenuItem
                                        itemText={"Delete"}
                                        onClick={onClickDeleteOverflow([row])}
                                        isDelete
                                        requireTitle
                                      />
                                    </OverflowMenu>
                                  </DataTable.TableCell>
                                </DataTable.TableRow>
                              </React.Fragment>
                            ))}
                          </DataTable.TableBody>
                        </DataTable.Table>
                      </DataTable.TableContainer>
                    )}
                  </DataTable>
                )}
              </div>
            </Column>
          </Row>
        </Grid>
      )}
    </div>
  );
}
