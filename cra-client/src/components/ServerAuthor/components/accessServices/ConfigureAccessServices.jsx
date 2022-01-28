/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext, useState, useEffect } from "react";

import { IdentificationContext } from "../../../../contexts/IdentificationContext";
import { ServerAuthorContext } from "../../contexts/ServerAuthorContext";
import {
  issueRestCreate,
  issueRestDelete,
  issueRestUpdate,
} from "../../../common/RestCaller";
import {
  Column,
  Grid,
  Row,
  Select,
  SelectItem,
  Toggle,
  Button,
  DataTable,
  OverflowMenu,
  OverflowMenuItem,
} from "carbon-components-react";
import { MisuseOutline16, Edit16 } from "@carbon/icons-react";
import CommunityProfileOptions from "./options/CommunityProfileOptions";
import AllOptions from "./options/AllOptions";
import AssetLineageOptions from "./options/AssetLineageOptions";
import AllZonesOptions from "./options/AllZonesOptions";
import SupportedZoneOption from "./options/SupportedZoneOption";

export default function ConfigureAccessServices() {

  const [currentAccessServiceId, setCurrentAccessServiceId] = useState();
  const [currentAccessServiceOptions, setCurrentAccessServiceOptions] =
    useState();

  // const [allOptionedOMASes, setAllOptionedOMASes] = useState([]);
  // const [accessServicesSelectionForAdd, setAccessServicesSelectionForAdd] =
  //   useState();
  const [operation, setOperation] = useState();
  const [showAllAccessServices, setShowAllAccessServices] = useState(true);
  

  // list of all the omas identifiers that only have supportedZone as an option
  const supportedZoneOMASArray = [
    "asset-catalog",
    "asset-consumer",
    "data-privacy",
    "devops",
    "information-view",
    "it-infrastructure",
    "project-management",
    "security-officer",
    "software-developer",
    "stewardship-action",
  ];
  // list of all the omas identifiers that published supported and default zones.
  const allZonesOMASArray = [
    "data-manager",
    "asset-owner",
    "data-engine",
    "data-platform",
    "digital-architect",
    "digital-service",
    "discovery-engine",
    "govenance-engine",
    "security-manager",
  ];

  const {
    currentAccessServices,
    setCurrentAccessServices,
    setLoadingText,
    newServerName,
    fetchServerConfig,
    unconfiguredAccessServices,
  } = useContext(ServerAuthorContext);

  const { userId, serverName: tenantId } = useContext(IdentificationContext);

  // useEffect(() => {
  //   const isNoOptionOMAS = (id) => {
  //     let allOptionedOMASArray =
  //       supportedZoneOMASArray.concat(allZonesOMASArray);
  //     allOptionedOMASArray.push("community-profile");
  //     allOptionedOMASArray.push("asset-lineage");
  //     setAllOptionedOMASes(allOptionedOMASArray);
  //   };
  // }, []);

  useEffect(() => {
    let accessServiceDefinition;
    let availableAccessServices = [];
    if (currentAccessServiceId !== undefined) {
      for (let i = 0; i < availableAccessServices.length; i++) {
        accessServiceDefinition = availableAccessServices[i];
        if (
          currentAccessServiceId === accessServiceDefinition.serviceURLMarker
        ) {
          setCurrentAccessServiceId(accessServiceDefinition.serviceURLMarker);
          // setCurrentAccessServiceName(accessServiceDefinition.serviceFullName);
          // setCurrentAccessServiceDescription(
          //   accessServiceDefinition.serviceDescription
          // );
        }
      }
      if (accessServiceDefinition !== undefined) {
        alert(
          "Error could not find " +
            currentAccessServiceId +
            " in the available access services"
        );
      } else {
        let isCurrentAccessService = false;
        for (let j = 0; j < currentAccessServices.length; j++) {
          const currentAccessService = currentAccessServices[j];
          if (
            currentAccessServiceId === currentAccessService.serviceURLMarker
          ) {
            // indicate this access service already is associated with the server so copy in its options
            isCurrentAccessService = true;
          }
        }
      }
    }
  }, [currentAccessServiceId]);

  useEffect(() => {
    if (showAllAccessServices && operation !== "Add All") {
      setOperation("Add All");
    }
    if (!showAllAccessServices && operation === "Add All") {
      setOperation(undefined)
    }
  }, [showAllAccessServices, operation]);

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
    // setCurrentAccessServiceName(undefined);
    // setCurrentAccessServiceDescription(undefined);
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
    setCurrentAccessServiceId(e.target.value);
  };

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
  };

  const onFinishedOperation = () => {
    if (operation === "Add") {
      issueAdd(currentAccessServiceOptions);
    } else if (operation === "Add All") {
      issueAddAll(currentAccessServiceOptions);
    } else if (operation === "Edit") {
      issueEdit(currentAccessServiceOptions);
    }
  };
  const onCancelOperation = () => {
    setOperation(undefined);
  };

  const onCurrentOptionsChanged = (options) => {
    setCurrentAccessServiceOptions(options);
  };

  const issueAddAll = (options) => {
    if (showAllAccessServices) {
      const addAccessServiceURL = encodeURI(
        "/servers/" +
          tenantId +
          "/server-author/users/" +
          userId +
          "/servers/" +
          newServerName +
          "/access-services"
      );
      setOperation(undefined);
      console.log("addAccessServiceURL " + addAccessServiceURL);
      setLoadingText("Adding all access services");
      issueRestCreate(
        addAccessServiceURL,
        options,
        onSuccessfulAddAccessService,
        onErrorAccessServices,
        "omagServerConfig"
      );
    }
  };
  const issueAdd = (options) => {
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
      console.log("addAccessServiceURL " + addAccessServiceURL);
      setLoadingText("Adding access service");
      issueRestCreate(
        addAccessServiceURL,
        options,
        onSuccessfulAddAccessService,
        onErrorAccessServices,
        "omagServerConfig"
      );
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
    const body = getAccessOptionsForBody();
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

  const onSuccessfulAddAccessService = () => {
    console.log("onSuccessfulAddAccessService entry");
    document.getElementById("loading-container").style.display = "none";
    setLoadingText("Refreshing access services ");
    setOperation(undefined);
    setShowAllAccessServices(false);

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
    // setCurrentAccessServiceName(undefined);
    // setCurrentAccessServiceDescription(undefined);
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

  // options functions
  const handleAddPublishZones = (zoneName) => {
    console.log("handleAddPublishZones() called", { zoneName });
    if (zoneName.length === 0) return;
    setAddPublishZoneName(zoneName);
  };
  const handleRemovePublishZones = (index) => {
    console.log("handleRemovePublishZones() called", { index });
    setRemovePublishZoneIndex(index);
  };

  const handleAddDefaultZones = (zoneName) => {
    console.log("handleAddDefaultZones() called", { zoneName });
    if (zoneName.length === 0) return;
    setAddDefaultZoneName(zoneName);
  };
  const handleRemoveDefaultZones = (index) => {
    console.log("handleRemoveDefaultZones() called", { index });
    setRemoveDefaultZoneIndex(index);
  };

  const handleAddSupportedZones = (zoneName) => {
    console.log("handleAddSupportedZones() called", { zoneName });
    if (zoneName.length === 0) return;
    setAddSupportedZoneName(zoneName);
  };
  const handleRemoveSupportedZones = (index) => {
    console.log("handleRemoveSupportedZones() called", { index });
    setRemoveSupportedZoneIndex(index);
  };
  const onlySupportedZone = () => {
    let includeZone = false;

    return includeZone;
  };
  const onToggle = () => {
    console.log("onToggle");
    // isToggled is the current state
    setShowAllAccessServices((isToggled) => !isToggled);
  };

  return (
    <div className="left-text">
      <Toggle
        aria-label="allSpecificAccessOptionsToggle"
        defaultToggled
        toggled ={showAllAccessServices}
        labelText="Access Service Configuration"
        labelA="Supply options for a chosen access service"
        labelB="Supply the options to be used by all the OMAS services"
        id="allSpecificAccessOptionsToggle"
        onToggle={onToggle}
      />
      {showAllAccessServices && operation === "Add All" && (
        <div>
          <AllOptions
            onCurrentOptionsChanged={onCurrentOptionsChanged}
            operation={operation}
            options={currentAccessServiceOptions}
          ></AllOptions>
          <fieldset className="bx--fieldset left-text-bottom-margin-32">
            <button onClick={(e) => onCancelOperation()}>Cancel Add All</button>
            <button onClick={(e) => onFinishedOperation()}>
              Issue Add All services with the following options
            </button>
          </fieldset>
        </div>
      )}

      {operation === "Add" && (
        <div>
          {!showAllAccessServices && (
            <div>
              <h4>Add Access Service</h4>
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
                  {unconfiguredAccessServices.map((service) => (
                    <SelectItem
                      text={service.serviceName}
                      value={service.serviceURLMarker}
                      id={service.serviceURLMarker}
                      key={service.serviceURLMarker}
                    />
                  ))}
                </Select>
              </div>

              {currentAccessServiceId === "community-profile" && (
                <CommunityProfileOptions
                  onCurrentOptionsChanged={onCurrentOptionsChanged}
                  operation={operation}
                  options={currentAccessServiceOptions}
                ></CommunityProfileOptions>
              )}
              {currentAccessServiceId === "asset-lineage" && (
                <AssetLineageOptions
                  onCurrentOptionsChanged={onCurrentOptionsChanged}
                  operation={operation}
                  options={currentAccessServiceOptions}
                ></AssetLineageOptions>
              )}

              {currentAccessServiceId &&
                supportedZoneOMASArray.indexOf(currentAccessServiceId) > -1 && (
                  <SupportedZoneOption
                    onCurrentOptionsChanged={onCurrentOptionsChanged}
                    operation={operation}
                    options={currentAccessServiceOptions}
                  ></SupportedZoneOption>
                )}
              {currentAccessServiceId &&
                allZonesOMASArray.indexOf(currentAccessServiceId) > -1 && (
                  <AllZonesOptions
                    onCurrentOptionsChanged={onCurrentOptionsChanged}
                    operation={operation}
                    options={currentAccessServiceOptions}
                  ></AllZonesOptions>
                )}
            </div>
          )}
          {operation !== undefined && (
            <fieldset className="bx--fieldset left-text-bottom-margin-32">
              <button onClick={(e) => onCancelOperation()}>
                Cancel {operation}
              </button>
              <button onClick={(e) => onFinishedOperation()}>
                Issue {operation}
              </button>
            </fieldset>
          )}
        </div>
      )}
      {operation === "Edit" && <h4>Edit Access Service</h4>}
            operation is {operation}
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
