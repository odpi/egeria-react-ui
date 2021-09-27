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
  DataTable,
  OverflowMenu,
  OverflowMenuItem,
} from "carbon-components-react";
import { MisuseOutline16, Edit16 } from "@carbon/icons-react";
import AuthorStringList from "../../common/AuthorStringList";

export default function ConfigureAccessServices() {
  const [currentAccessServiceName, setCurrentAccessServiceName] = useState();
  const [currentAccessServiceDescription, setCurrentAccessServiceDescription] =
    useState();
  const [currentAccessServiceId, setCurrentAccessServiceId] = useState();
  const [currentAccessServiceURL, setCurrentAccessServiceURL] = useState();
  const [currentAccessServiceOptions, setCurrentAccessServiceOptions] =
    useState();
  const [accessServicesSelectionForAdd, setAccessServicesSelectionForAdd] =
    useState();
  const [operation, setOperation] = useState();

  // access service options.

  // supported zones
  const [addSupportedZoneName, setAddSupportedZoneName] = useState();
  const [removeSupportedZoneIndex, setRemoveSupportedZoneIndex] = useState();
  const [supportedZoneNames, setSupportedZones] = useState([]);
  // default zones
  const [addDefaultZoneName, setAddDefaultZoneName] = useState();
  const [removeDefaultZoneIndex, setRemoveDefaultZoneIndex] = useState();
  const [defaultZones, setDefaultZones] = useState([]);
  // publish zones
  const [addPublishZoneName, setAddPublishZoneName] = useState();
  const [removePublishZoneIndex, setRemovePublishZoneIndex] = useState();
  const [publishZoneNames, setPublishZones] = useState([]);
  // Karma Point Plateau
  const [newKarmaPointPlateau, setKarmaPointPlateau] = useState();
  // Karma Point Increment
  const [newKarmaPointIncrement, setKarmaPointIncrement] = useState();

  const [unconfiguredAccessServices, setUnconfiguredAccessServices] = useState(
    []
  );

  const {
    currentAccessServices,
    setCurrentAccessServices,
    setLoadingText,
    availableAccessServices,
    newServerName,
    fetchServerConfig,
  } = useContext(ServerAuthorContext);

  const { userId, serverName: tenantId } = useContext(IdentificationContext);

  useEffect(() => {
    let accessServiceDefinition;
    for (let i = 0; i < availableAccessServices.length; i++) {
      accessServiceDefinition = availableAccessServices[i];
      if (currentAccessServiceId === accessServiceDefinition.serviceURLMarker) {
        setCurrentAccessServiceId(accessServiceDefinition.serviceURLMarker);
        setCurrentAccessServiceName(accessServiceDefinition.serviceFullName);
        setCurrentAccessServiceDescription(
          accessServiceDefinition.serviceDescription
        );
      }
    }
    if (accessServiceDefinition === undefined) {
      alert(
        "Error could not find " +
          currentAccessServiceId +
          " in the available access services"
      );
    } else {
      let isCurrentAccessService = false;
      for (let j = 0; j < currentAccessServices.length; j++) {
        const currentAccessService = currentAccessServices[j];
        if (currentAccessServiceId === currentAccessService.serviceURLMarker) {
          // indicate this access service already is associated with the server so copy in its options
          isCurrentAccessService = true;
        }
      }
      // if (!isCurrentAccessService) {
      //   clearCurrentOptions();
      // }
    }
  }, [currentAccessServiceId]);

  // Default zones
  useEffect(() => {
    if (addDefaultZoneName !== undefined && addDefaultZoneName !== "") {

      const newDefaultZones = [...defaultZones, addDefaultZoneName];
      setDefaultZones(newDefaultZones);
      setAddDefaultZoneName("");
    }
  }, [addDefaultZoneName]);

  useEffect(() => {
    if (removeDefaultZoneIndex !== undefined && removeDefaultZoneIndex !== "") {
      let newDefaultZones = [...defaultZones];
   
      if (removeDefaultZoneIndex > -1) {
        newDefaultZones.splice(removeDefaultZoneIndex, 1);
        setDefaultZones(newDefaultZones);
        setRemoveDefaultZoneIndex("");
      }
    }
  }, [removeDefaultZoneIndex]);

  // Publish zones
  useEffect(() => {
    if (addPublishZoneName !== undefined && addPublishZoneName !== "") {
      const newPublishZoneNames = [...publishZoneNames, addPublishZoneName];
      setPublishZones(newPublishZoneNames);
      setAddPublishZoneName("");
    }
  }, [addPublishZoneName]);

  useEffect(() => {
    if (removePublishZoneIndex !== undefined && removePublishZoneIndex !== "") {
      let newPublishZoneNames = [...publishZoneNames];
      if (removePublishZoneIndex > -1) {
        newPublishZoneNames.splice(removePublishZoneIndex, 1);
        setPublishZones(newPublishZoneNames);
        setRemovePublishZoneIndex("");
      }
    }
  }, [removePublishZoneIndex]);

  // Supported zones

  useEffect(() => {
    if (addSupportedZoneName !== undefined && addSupportedZoneName !== "") {
      const newSupportedZoneNames = [...supportedZoneNames, addSupportedZoneName];
      setSupportedZones(newSupportedZoneNames);
      setAddSupportedZoneName("");
    }
  }, [addSupportedZoneName]);

  useEffect(() => {
    if (removeSupportedZoneIndex !== undefined && removeSupportedZoneIndex !== "") {
      let newSupportedZoneNames = [...supportedZoneNames];
      if (removeSupportedZoneIndex > -1) {
        newSupportedZoneNames.splice(removeSupportedZoneIndex, 1);
        setSupportedZones(newSupportedZoneNames);
        setRemoveSupportedZoneIndex("");
      }
    }
  }, [removeSupportedZoneIndex]);

useEffect(() => {
  let currentUrlMarkers = [];
  if (currentAccessServices && currentAccessServices.length > 0) {
    currentUrlMarkers = currentAccessServices.map((service) => service.id);
  }
  let services = [];
  for (let i = 0; i < availableAccessServices.length; i++) {
    const availableAccessService = availableAccessServices[i];
    if (
      !currentUrlMarkers.includes(availableAccessService.serviceURLMarker)
    ) {
     services.push(availableAccessService);
      // clear out the option states
      // clearCurrentOptions();
    }
  }
  setUnconfiguredAccessServices(services);

}, [currentAccessServices]);



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
  const clearCurrentOptions = () => {
    // supported zones
    setAddSupportedZoneName(undefined);
    setRemoveSupportedZoneIndex(undefined);
    setSupportedZones = useState([]);
    // default zones
    setAddDefaultZoneName(undefined);
    setRemoveDefaultZoneIndex(undefined);
    setDefaultZones([]);
    // publish zones
    setAddPublishZoneName(undefined);
    setRemovePublishZoneIndex(undefined);
    setPublishZones([]);
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

  const onClickFinishedOperation = () => {
    if (operation === "Add") {
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
       const body = getAccessOptionsForBody();
      console.log("addAccessServiceURL " + addAccessServiceURL);
      setLoadingText("Adding access service");
      issueRestCreate(
        addAccessServiceURL,
        body,
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
/**
 * 
 *  for each access service
 *    if there are options,
 *    if those options have been specified
 *        then copy them from the state into the json.
 * else
 *    return undefined
 *
 *   @returns options or undefined
 */
  const getAccessOptionsForBody = () => {
    let options = {};

    if (currentAccessServiceId === "community-profile") {
      if (defaultZones !== undefined && defaultZones.length > 0) {
        options.DefaultZones = defaultZones;
      }
      if (supportedZoneNames !== undefined && supportedZoneNames.length > 0) {
        options.SupportedZones = supportedZoneNames;
      }
      if (publishZoneNames !== undefined && publishZoneNames.length > 0) {
        options.PublishZones = publishZoneNames;
      }
    }

    if(!Object.keys(options).length){
       options = undefined;
     }
     return options;
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

  return (
    <div className="left-text">
      {operation === "Add" && (
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
            <div>
              <AuthorStringList
                handleAddString={handleAddDefaultZones}
                handleRemoveStringAtIndex={handleRemoveDefaultZones}
                stringLabel={"Default Zones"}
                idPrefix="default-zones"
                stringValues={defaultZones}
              />

              <AuthorStringList
                handleAddString={handleAddPublishZones}
                handleRemoveStringAtIndex={handleRemovePublishZones}
                stringLabel={"Publish Zones"}
                idPrefix="publish-zones"
                stringValues={publishZoneNames}
              />

              <AuthorStringList
                handleAddString={handleAddSupportedZones}
                handleRemoveStringAtIndex={handleRemoveSupportedZones}
                stringLabel={"Supported Zones"}
                idPrefix="supported-zones"
                stringValues={supportedZoneNames}
              />

              <TextInput
                id="KarmaPointPlateau"
                name="KarmaPointPlateau"
                type="number"
                labelText="Karma Point Plateau"
                value={newKarmaPointPlateau}
                onChange={(e) => setKarmaPointPlateau(e.target.value)}
                invalid={newKarmaPointPlateau === ""}
                style={{ marginBottom: "16px", width: "100%" }}
                autoComplete="off"
              />
              <TextInput
                id="KarmaPointIncrement"
                name="KarmaPointIncrement"
                type="number"
                labelText="Karma Point Increment"
                value={newKarmaPointIncrement}
                onChange={(e) => setKarmaPointIncrement(e.target.value)}
                style={{ marginBottom: "16px", width: "100%" }}
                autoComplete="off"
              />
            </div>
          )}
        </div>
      )}
      {operation === "Edit" && <h4>Edit Access Service</h4>}

      {operation !== undefined && (
        <fieldset className="bx--fieldset left-text-bottom-margin-32">
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
