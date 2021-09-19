/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext, useState, useEffect } from "react";

import { IdentificationContext } from "../../../contexts/IdentificationContext";
import { ServerAuthorContext } from "../contexts/ServerAuthorContext";
import {
  issueRestCreate,
  issueRestDelete,
  issueRestUpdate,
} from "../../common/RestCaller";
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
import { MisuseOutline16, Edit16 } from "@carbon/icons-react";
import areIntervalsOverlappingWithOptions from "date-fns/esm/fp/areIntervalsOverlappingWithOptions/index.js";
// protected String   supportedZonesPropertyName      = "SupportedZones";      /* Common */
// protected String   defaultZonesPropertyName        = "DefaultZones";        /* Common */
// protected String   publishZonesPropertyName        = "PublishZones";        /* Common */
// protected String   karmaPointPlateauPropertyName   = "KarmaPointPlateau";   /* Community Profile OMAS */
// protected String   karmaPointIncrementPropertyName = "KarmaPointIncrement"; /* Community Profile OMAS */

export default function ConfigureAccessServices() {
  const [currentAccessServiceName, setCurrentAccessServiceName] = useState();
  const [currentAccessServiceDescription, setCurrentAccessServiceDescription] =
    useState();
  const [currentAccessServiceId, setCurrentAccessServiceId] = useState();
  const [currentAccessServiceURL, setCurrentAccessServiceURL] = useState();
  const [currentAccessServiceOptions, setCurrentAccessServiceOptions] =
    useState();
  const [accessServicesSelectionForAdd, setAccessServicesSelectionForAdd] = useState();  
  const [operation, setOperation] = useState();

  const { currentAccessServices, setCurrentAccessServices,
          setLoadingText,
          availableAccessServices,
          newServerName,
          fetchServerConfig
     } =
    useContext(ServerAuthorContext);

  const { userId, serverName: tenantId } = useContext(IdentificationContext);

  const headers = [
    {
      key: "name",
      header: "Access Service Name",
    },
    {
      key: "description",
      header: "Access Service Description",
    },
  ];

  const onClickAdd = () => {
    setCurrentAccessServiceName(undefined);
    setCurrentAccessServiceDescription(undefined);
    setCurrentAccessServiceId(undefined);
    setCurrentAccessServiceOptions(undefined);
    setOperation("Add");
  };

  const onClickRemoveAll = () => {
    const deleteAllAccessServicesURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/access-services"
    );
    setLoadingText("Removing all access services");
    issueRestDelete(
      deleteAllAccessServicesURL,
      onSuccessfulRemoveAll,
      onErrorAccessServices
    );
  };
  const getAccessServicesSelectionForAdd = () => {
    let currentUrlMarkers = [];
    if (currentAccessServices && currentAccessServices.length >0) {
      currentUrlMarkers = currentAccessServices.map((service) => service.id);
    }
    let potentialNewAccessServices = [];
    for (let i=0;i<availableAccessServices.length;i++) {
      const availableAccessService = availableAccessServices[i];
        if (!currentUrlMarkers.includes(availableAccessService.serviceURLMarker)) {
          potentialNewAccessServices.push(availableAccessService);
        }
    }
    return (
      <div>
      <Select
        defaultValue="placeholder-item"
        // helperText={serverTypeDescription}
        onChange={onChangeAccessServiceSelected}
        id="select-access-server"
        invalidText="A valid value is required"
      >
        <SelectItem
                text="Choose an access service"
                value="placeholder-item"
                disabled
                hidden
              />
          {potentialNewAccessServices.map((service) => (
              <SelectItem text={service.serviceName} value={service.serviceURLMarker} id={service.serviceURLMarker} />
            ))}
      </Select>
      </div>
    );
  };

  const onClickEditOverflow = (selectedRows) => () => {
    console.log("called onClickEditOverflow", { selectedRows });
    if (selectedRows.length === 1) {
      editAction(selectedRows[0].id);
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

  const onClickEditBatchAction = (selectedRows) => {
    console.log("called onClickEditBatchAction", { selectedRows });
    if (selectedRows.length === 1) {
      editAction(selectedRows[0].id);
    }
  };

  const onChangeAccessServiceSelected = (e) => {
      // TODO
      const currentUrlMarker = e.target.value;
      
      for (let i=0;i<availableAccessServices.length;i++) {
        const accessService = availableAccessServices[i];
        if (currentUrlMarker === accessService.serviceURLMarker) {
            setCurrentAccessServiceId(accessService.serviceURLMarker);
            setCurrentAccessServiceName(accessService.serviceFullName);
            setCurrentAccessServiceDescription(accessService.serviceDescription);
            // setCurrentAccessServiceOptions(accessService.); 
        }
      }
  }

  const deleteAction = (name) => {
    const deleteAccessServiceURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/access-services/" +
        name
    );

    issueRestDelete(
      deleteAccessServiceURL,
      onSuccessfulRemove,
      onErrorAccessServices
    );
  };

  const editAction = (id) => {
    let accessServiceToEdit;
   

    //   const supportedSeveritiesSelectedNames =
    //     accessServiceToEdit.supportedSeverities;

    //   let checkedSupportedSeverities = [];
    //   for (let i = 0; i < supportedAuditLogSeverities.length; i++) {
    //     let severity = supportedAuditLogSeverities[i];
    //     severity.selected = supportedSeveritiesSelectedNames.includes(
    //       severity.id
    //     );
    //     checkedSupportedSeverities.push(severity);
    //   }
    //   //we need to store the original name as this is the key that will be updated in the rest call.
    //   setCurrentDestinationId(destinationName);
    //   //the name could change in the editor
    //   setCurrentDestinationName(destinationName);
    //   setCurrentDestinationDescription(accessServiceToEdit.description);
    //   setCurrentSupportedSeverities(checkedSupportedSeverities);
    //   setCurrentDestinationTypeName(accessServiceToEdit.type);

    //   let op = "Edit";
    //   if (isCopy) {
    //     op = "Copy";
    //   }
    //   setOperation(op);
    // } else {
    //   alert("unable to find name " + name);
    // }
  };

  const onClickFinishedOperation = () => {
    if (operation === "Add" ) {
      issueAdd();
    } else if (operation === "Edit") {
      issueEdit();
    }
  };
  const onClickCancelOperation = () => {
    setOperation(undefined);
  };

  const issueAdd = () => {
    if (currentAccessServiceId) {
    const addAccessServiceURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/access-services/" +
        currentAccessServiceId
    );
    setOperation(undefined);
    // const body = getRestBody();
    console.log("addAccessServiceURL " + addAccessServiceURL);
    setLoadingText("Adding access service");
    issueRestCreate(
      addAccessServiceURL,
      undefined,
      onSuccessfulAddAccessService,
      onErrorAccessServices,
      "omagServerConfig"
    );
    } else {
      alert("Please choose a type of access service");
    }
  };
  const issueEdit = () => {
    setOperation(undefined);

    const editAccessServiceURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/access-services/" +
        currentAccessServiceId
    );
    const body = getRestBody();
    console.log("editAccessServiceURL " + editAccessServiceURL);
    setLoadingText("Editing audit log destination");
    issueRestUpdate(
      editAccessServiceURL,
      body,
      onSuccessfulEditAccessService,
      onErrorAccessServices,
      "omagServerConfig"
    );
  };

  const getRestBody = () => {
   return undefined;
  };
  const onSuccessfulAddAccessService = () => {
    console.log("onSuccessfulAddAccessService entry");
    document.getElementById("loading-container").style.display = "none";
    setLoadingText("Refreshing access services ");
    // retrieveAllServers
    fetchServerConfig(refreshCurrentAccessServices, onErrorAccessServices);
  };
  const onSuccessfulEditAccessService = () => {
    console.log("onSuccessfulEditAccessService ");
    document.getElementById("loading-container").style.display = "none";
    setLoadingText("Refreshing access services ");
    fetchServerConfig(refreshCurrentAccessServices, onErrorAccessServices);
  };

  const onSuccessfulRemoveAll = () => {
    setCurrentAccessServiceName(undefined);
    setCurrentAccessServiceDescription(undefined);
    setCurrentAccessServiceId(undefined);
    setCurrentAccessServiceOptions(undefined);
    setSelectedAccessServices([]);
    document.getElementById("loading-container").style.display = "none";
  };

  const onSuccessfulRemove = (e) => {
    console.log("onSuccessfulRemove");
    // Fetch Server Config
    setLoadingText("Refreshing access services ");
    fetchServerConfig(refreshCurrentAccessServices, onErrorAccessServices);
  };

  const refreshCurrentAccessServices = (response) => {
    console.log("refreshCurrentAccessServices");
    console.log(response);
    let refreshedAccessServices = [];
    const config = response.omagServerConfig;
    if (config) {
      const accessServicesFromServer = config.accessServicesConfig;

      if (accessServicesFromServer) {
        for (let i = 0; i < accessServicesFromServer.length; i++) {
          const serverAccessService = accessServicesFromServer[i];
          let accessService = {};
          accessService.id = serverAccessService.accessServiceURLMarker;
          accessService.name = serverAccessService.accessServiceFullName;
          accessService.description =
            serverAccessService.accessServiceDescription;
          accessService.urlMarker = serverAccessService.accessServiceURLMarker;
          accessService.accessServiceWiki =
            serverAccessService.accessServiceWiki;
          accessService.options = serverAccessService.accessServiceOptions;
          refreshedAccessServices.push(accessService);
        }
      }
      setCurrentAccessServices(refreshedAccessServices);
    }
    document.getElementById("loading-container").style.display = "none";
  };

  const onErrorAccessServices = (err) => {
    console.log("onErrorAccessServices");
    console.log(err);
    document.getElementById("loading-container").style.display = "none";
    alert("Error occurred configuring access services");
  };

  return (
    <div className="left-text">
      {operation === "Add" && (
       <div> 
      <h4>Add Access Service</h4>
      {getAccessServicesSelectionForAdd()}
      </div>
      )}
      {operation === "Edit" && <h4>Edit Access Service</h4>}

      {operation !== undefined && (
        <fieldset className="bx--fieldset left-text-bottom-margin-32">
          {/* <TextInput
            id="new-access-service-name"
            name="new-access-service-name"
            type="text"
            labelText="Audit Log Destination Name"
            value={currentAccessServiceName}
            onChange={(e) => setCurrentDestinationName(e.target.value)}
            placeholder="my console"
            invalid={currentDestinationName === ""}
            style={{ marginBottom: "16px", width: "100%" }}
            autoComplete="off"
          />
          <TextInput
            id="new-access-service-description"
            name="new-access-service-description"
            type="text"
            labelText="Audit Log Destination Description"
            value={currentDestinationDescription}
            onChange={(e) => setCurrentDestinationDescription(e.target.value)}
            style={{ marginBottom: "16px", width: "100%" }}
            autoComplete="off"
          /> */}
          {/* <Select
            // defaultValue={currentAccessService}
            helperText={destinationTypeDescription}
            onChange={onChangeTypeSelected}
            id="select-server-type"
            invalidText="A valid value is required"
            labelText="Select Audit Log Destination Type"
          >
            {accessServices.map((dest) => (
              <SelectItem text={dest.label} value={dest.id} id={dest.id} />
            ))}
          </Select> */}
    
          <button onClick={(e) => onClickCancelOperation()}>
            Cancel {operation}
          </button>
          <button onClick={(e) => onClickFinishedOperation()}>
            Issue {operation}
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
                {currentAccessServices && (
                  <DataTable
                    rows={currentAccessServices}
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
                        // title="Select Access Services"
                        description="List of all of the configured Access Servers"
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
                              id="known-access-services-search"
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
                                  key={`defined-access-services-header-${i}`}
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
