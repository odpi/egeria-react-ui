/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import axios from "axios";

import { IdentificationContext } from "../../../contexts/IdentificationContext";

import serverTypes from "../components/defaults/serverTypes";
import serverConfigElements from "../components/defaults/serverConfigElements";

// import viewServices from "../components/defaults/viewServices";
// import integrationServices from "../components/defaults/integrationServices";
import {
  issueRestCreate,
  issueRestGet,
  issueRestDelete,
} from "../../common/RestCaller";
// import { set } from "date-fns";

export const ServerAuthorContext = createContext();
export const ServerAuthorContextConsumer = ServerAuthorContext.Consumer;

const ServerAuthorContextProvider = (props) => {
  const {
    userId,
    serverName: serverName,
    user,
  } = useContext(IdentificationContext);

  // All Servers
  const [allServers, setAllServers] = useState([]);
  // supported audit log severities
  const [supportedAuditLogSeverities, setSupportedAuditLogSeverities] =
    useState([]);
  // Basic Config
  const [currentServerName, setCurrentServerName] = useState("");
  const [currentServerLocalURLRoot, setCurrentServerLocalURLRoot] = useState(
    "https://localhost:9443"
  );
  const [currentPlatformName, setCurrentPlatformName] = useState("");

  const [currentServerLocalServerType, setCurrentServerLocalServerType] = useState(
    serverTypes[0].id
  ); // default to metadata server for now
  const [currentServerOrganizationName, setCurrentServerOrganizationName] = useState(
    user ? user.organizationName || "" : ""
  );
  const [currentServerLocalUserId, setCurrentServerLocalUserId] = useState("");
  const [currentServerDescription, setCurrentServerDescription] = useState("");
  const [currentServerLocalPassword, setCurrentServerLocalPassword] = useState("");
  const [currentServerSecurityConnector, setCurrentServerSecurityConnector] =
    useState("");
  const [currentServerRepository, setCurrentServerRepository] = useState(
    "in-memory-repository"
  );
  const [currentServerMaxPageSize, setCurrentServerMaxPageSize] = useState(1000);
  const [currentServerAuditDestinations, setCurrentServerAuditDestinations] =
    useState([]);
  // Active Platforms by name
  const [activePlatforms, setActivePlatforms] = useState();
  // const [activePlatform, setActivePlatform] = useState();

  const [isCurrentStepInvalid,setIsCurrentStepInvalid] = useState(true);

  // Cohorts
  const [currentServerCohorts, setCurrentServerCohorts] = useState([]);
  const [registerCohortName, setRegisterCohortName] = useState();
  const [unregisterCohortName, setUnregisterCohortName] = useState();
  // Archives
  const [currentServerOMArchives, setCurrentServerOMArchives] = useState([]);
  // Proxy
  const [currentServerProxyConnector, setCurrentServerProxyConnector] = useState("");
  const [currentServerEventMapperConnector, setCurrentServerEventMapperConnector] =
    useState("");
  const [currentServerEventSource, setCurrentServerEventSource] = useState("");
  // access services
  const [availableAccessServices, setAvailableAccessServices] = useState();
  const [currentAccessServices, setCurrentAccessServices] = useState([]);
  const [unconfiguredAccessServices, setUnconfiguredAccessServices] = useState(
    []
  );

  const [currentAccessServiceId, setCurrentAccessServiceId] = useState();
  const [currentAccessServiceName, setCurrentAccessServiceName] = useState();
  const [currentAccessServiceOptions, setCurrentAccessServiceOptions] =
    useState();
  const [operationForAccessServices, setOperationForAccessServices] =
    useState();
  const [showAllAccessServices, setShowAllAccessServices] = useState(true);

  // access services supported options

  // supported zones
  const [supportedZoneNames, setSupportedZoneNames] = useState([]);
  // default zones
  const [defaultZoneNames, setDefaultZoneNames] = useState([]);
  // publish zones
  const [publishZoneNames, setPublishZoneNames] = useState([]);
  // Karma Point Plateau
  const [karmaPointPlateau, setKarmaPointPlateau] = useState();
  // Karma Point Increment
  const [karmaPointIncrement, setKarmaPointIncrement] = useState();
  // chunk
  const [
    glossaryTermLineageEventsChunkSize,
    setGlossaryTermLineageEventsChunkSize,
  ] = useState();

  const addSupportedZoneName = (zoneName) => {
    if (zoneName !== undefined && zoneName !== "") {
      setSupportedZoneNames([...supportedZoneNames, zoneName]);
    }
  };
  const removeSupportedZoneByIndex = (index) => {
    if (index !== undefined && index !== "") {
      if (index > -1) {
          setSupportedZoneNames(
            [
              ...supportedZoneNames.slice(0, index),
              ...supportedZoneNames.slice(index + 1)
            ]);
      }
    }
  };
  const addDefaultZoneName = (zoneName) => {
    if (zoneName !== undefined && zoneName !== "") {
      setDefaultZoneNames([...defaultZoneNames, zoneName]);
    }
  };
  const removeDefaultZoneByIndex = (index) => {
    if (index !== undefined && index !== "") {
      if (index > -1) {
          setDefaultZoneNames(
          [
            ...defaultZoneNames.slice(0, index),
            ...defaultZoneNames.slice(index + 1)
          ]);
      }
    }
  };
  const addPublishZoneName = (zoneName) => {
    if (zoneName !== undefined && zoneName !== "") {
      setPublishZoneNames([...publishZoneNames, zoneName]);
    }
  };
  const removePublishZoneByIndex = (index) => {
    if (index !== undefined && index !== "") {
      if (index > -1) {
          setPublishZoneNames(
            [
              ...publishZoneNames.slice(0, index),
              ...publishZoneNames.slice(index + 1)
            ]);
      }
    }
  };

  useEffect(() => {
    // update the current options (the rest body) in the caller
    let options = {};
    if (defaultZoneNames !== undefined && defaultZoneNames.length > 0) {
      options.DefaultZones = defaultZoneNames;
    }
    if (supportedZoneNames !== undefined && supportedZoneNames.length > 0) {
      options.SupportedZones = supportedZoneNames;
    }
    if (publishZoneNames !== undefined && publishZoneNames.length > 0) {
      options.PublishZones = publishZoneNames;
    }
    if (karmaPointPlateau !== undefined) {
      options.karmaPointPlateau = karmaPointPlateau;
    }
    if (karmaPointIncrement !== undefined) {
      options.karmaPointIncrement = karmaPointIncrement;
    }
    if (glossaryTermLineageEventsChunkSize !== undefined) {
      options.glossaryTermLineageEventsChunkSize =
        glossaryTermLineageEventsChunkSize;
    }

    if (!Object.keys(options).length) {
      options = undefined;
    }
    setCurrentAccessServiceOptions(options);
  }, [
    supportedZoneNames,
    publishZoneNames,
    defaultZoneNames,
    karmaPointPlateau,
    karmaPointIncrement,
    glossaryTermLineageEventsChunkSize,
  ]);

  // view services
  const [availableViewServices, setAvailableViewServices] = useState();
  const [currentViewServices, setCurrentViewServices] = useState([]);
  // engine services
  const [availableEngineServices, setAvailableEngineServices] = useState();
  const [currentEngineServices, setCurrentEngineServices] = useState([]);
  const [
    currentServerViewServiceRemoteServerName,
    setCurrentServerViewServiceRemoteServerName,
  ] = useState("");
  const [
    currentServerViewServiceRemoteServerURLRoot,
    setCurrentServerViewServiceRemoteServerURLRoot,
  ] = useState("");

  // Integration Services
  const [availableIntegrationServices, setAvailableIntegrationServices] =
    useState();
  const [currentIntegrationServices, setCurrentIntegrationServices] = useState(
    []
  );
  const [
    currentServerIntegrationServiceRemoteServerName,
    setCurrentServerIntegrationServiceRemoteServerName,
  ] = useState("");
  const [
    currentServerIntegrationServiceRemoteServerURLRoot,
    setCurrentServerIntegrationServiceRemoteServerURLRoot,
  ] = useState("");
  const [
    currentServerIntegrationServiceConnectorName,
    setCurrentServerIntegrationServiceConnectorName,
  ] = useState("");
  const [
    currentServerIntegrationServiceConnectorUserId,
    setCurrentServerIntegrationServiceConnectorUserId,
  ] = useState("");
  const [
    currentServerIntegrationServiceConnection,
    setCurrentServerIntegrationServiceConnection,
  ] = useState("");
  const [
    currentServerIntegrationServiceMetadataSource,
    setCurrentServerIntegrationServiceMetadataSource,
  ] = useState("");
  const [
    currentServerIntegrationServiceRefreshTimeInterval,
    setCurrentServerIntegrationServiceRefreshTimeInterval,
  ] = useState(60);
  const [
    currentServerIntegrationServiceUsesBlockingCalls,
    setCurrentServerIntegrationServiceUsesBlockingCalls,
  ] = useState(false);
  const [
    currentServerIntegrationServicePermittedSynchronization,
    setCurrentServerIntegrationServicePermittedSynchronization,
  ] = useState("BOTH_DIRECTIONS");

  // Notifications
  const [notificationType, setNotificationType] = useState("error");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationSubtitle, setNotificationSubtitle] = useState("");
  // Progress
  const [progressIndicatorIndex, setProgressIndicatorIndex] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading...");
  // Preview & Deploy
  const [currentServerConfig, setCurrentServerConfig] = useState(null);
  const [preventDeployment, setPreventDeployment] = useState(false);

  // Refs
  const basicConfigFormStartRef = useRef(null);
  const integrationServicesFormStartRef = useRef(null);

  useEffect(() => {
    retrieveAllServers();
  }, []);
  // is this changes clear out the access service specific details
  useEffect(() => {
    if (showAllAccessServices) {
      setCurrentAccessServiceId(undefined);
      setCurrentAccessServiceName(undefined);
      setCurrentAccessServiceOptions(undefined);
    }
  }, [showAllAccessServices]);
  // basic step enable next button
  useEffect(() => {
      const steps = serverConfigurationSteps(currentServerLocalServerType);
      const id = steps[progressIndicatorIndex];
      const serverTypeElement = serverConfigElements.find(o => o.id === id); 

      if (serverTypeElement.id === "config-basic-config-element") {
        if (currentServerName !== "" && currentServerLocalUserId !== "" && currentServerOrganizationName !== "") {
          setIsCurrentStepInvalid(false);
        } else {
          setIsCurrentStepInvalid(true);
        }
        // console.log("CC");
        //    if (currentServerName !== "" && currentServerLocalUserId !== "" && currentServerOrganizationName !== "") {
        //     console.log("DD");
        //       let serverExists = false; 
        //       for (let i=0; i < allServers.length; i++) {
        //         console.log("for allServers[i].serverName =" +allServers[i].serverName);
        //         console.log("currentServerName="+currentServerName);
        //         if ( allServers[i].serverName === currentServerName) {
        //           console.log("Server exists!!!");
        //           serverExists = true;
        //         }
        //       }  
        //       if (serverExists) {
        //         console.log("Server " + currentServerName + " exists"  );
        //         setIsCurrentStepInvalid(true);
        //       } else {
        //         console.log("AA");
        //         setIsCurrentStepInvalid(false);
        //       }
        //     } else {
        //       console.log("BB");
        //       setIsCurrentStepInvalid(false);
        //    }
      }  
  }, [progressIndicatorIndex, currentServerName, currentServerLocalUserId, currentServerOrganizationName]);

  /**
   * Clear out all the context so the new server type doe not pick up old values in the wizard.
   * Leave currentServerLocalServerType
   */
  const cleanForcurrentServerType = () => {
    setCurrentServerConfig(null);
    // can/should we clear refs ???
    setCurrentServerName("");
    setCurrentServerLocalURLRoot("https://localhost:9443");
    setCurrentPlatformName("");
    setCurrentServerOrganizationName(user ? user.organizationName || "" : "");
    setCurrentServerLocalUserId("");
    setCurrentServerLocalPassword("");
    setCurrentServerSecurityConnector("");
    setCurrentServerRepository("in-memory-repository");
    setCurrentServerMaxPageSize(1000);

    // Audit log destinations
    setCurrentServerAuditDestinations([]);

    // Cohorts
    setCurrentServerCohorts([]);
    setRegisterCohortName("");
    setUnregisterCohortName("");

    // Archives
    setCurrentServerOMArchives([]);

    // Proxy
    setCurrentServerProxyConnector("");
    setCurrentServerEventMapperConnector("");
    setCurrentServerEventSource("");

    // access services
    setCurrentAccessServices([]), setCurrentAccessServices(undefined);
    setCurrentAccessServiceId(undefined);
    setCurrentAccessServiceOptions(undefined);
    setOperationForAccessServices(undefined);
    setShowAllAccessServices(true);

    // view services
    setCurrentViewServices([]);
    setCurrentServerViewServiceRemoteServerName("");
    setCurrentServerViewServiceRemoteServerURLRoot("");
  };

  const retrieveAllServers = () => {
    console.log("called retrieveAllServers()");

    const restURL = encodeURI(
      "/servers/" + serverName + "/server-author/users/" + userId + "/platforms"
    );
    issueRestGet(
      restURL,
      onSuccessfulFetchPlatforms,
      onErrorFetchPlatforms,
      "platforms"
    );
  };

  const onSuccessfulFetchPlatforms = (json) => {
    console.log("Successfully fetched platforms = " + JSON.stringify(json));
    const platforms = json.platforms;
    let serverList = [];
    if (platforms !== undefined && platforms.length > 0) {
      let platformMap = {};
      for (var i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        for (var j = 0; j < platform.storedServers.length; j++) {
          let svr = {};
          const storedServer = platforms[i].storedServers[j];

          svr.serverType = storedServer.serverType;
          svr.platformName = platform.platformName;
          svr.platformStatus = platform.platformStatus;
          svr.serverName = storedServer.storedServerName;
          svr.serverDescription = storedServer.storedServerDescription;
          svr.serverStatus = storedServer.serverStatus;
          svr.id = i + "_" + j; // note that server name is not unique - as it can exist on multiple platforms - so should not be used as the id.
          serverList.push(svr);
        }
        if (platform.platformStatus === "ACTIVE") {
          platformMap[platform.platformName] = platform;
        }
      }
      setAllServers(serverList);

      console.log(JSON.stringify(platforms));
      console.log("Platform map");
      console.log(JSON.stringify(platformMap));

      setActivePlatforms(platformMap);
    }
    const restURL = encodeURI(
      "/servers/" +
        serverName +
        "/server-author/users/" +
        userId +
        "/servers/" +
        serverName +
        "/audit-log-destinations"
    );
    issueRestGet(
      restURL,
      onSuccessfulFetchAuditLogSeverities,
      onErrorFetchAuditLogSeverities,
      "severities"
    );
  };

  const onErrorFetchPlatforms = () => {
    // error
    setAllServers([]);
    alert("Error getting all servers");
  };
  const onErrorFetchAuditLogSeverities = () => {
    // error
    setSupportedAuditLogSeverities([]);
    alert("Error getting audit log supported severities");
  };
  const onSuccessfulFetchAuditLogSeverities = (json) => {
    console.log(
      "Successfully fetched supported audit log severities = " +
        JSON.stringify(json)
    );
    const severities = json.severities;
    // give the items ids
    let severitiesWithIds = [];
    if (severities && severities.length > 0) {
      severitiesWithIds = severities.map(function (item) {
        if (item.id !== "<Unknown>") {
          return {
            id: item.name,
            label: item.name,
          };
        }
      });
    }

    setSupportedAuditLogSeverities(severitiesWithIds);
  };
  const fetchServerConfig = (onSuccessfulFetchServer, onErrorFetchServer) => {
    console.log("called fetchServerConfig");
    const fetchServerConfigURL = encodeURI(
      "/servers/" +
        serverName +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
        "/configuration"
    );

    issueRestGet(
      fetchServerConfigURL,
      onSuccessfulFetchServer,
      onErrorFetchServer,
      "omagServerConfig"
    );
  };

  const generateBasicServerConfig = () => {
    if (!currentServerName || currentServerName === "") {
      throw new Error(
        `Cannot create OMAG server configuration without Server Name`
      );
    }

    if (!currentServerLocalServerType || currentServerLocalServerType === "") {
      throw new Error(
        `Cannot create OMAG server configuration without Local Server Type`
      );
    }

    if (!currentServerOrganizationName || currentServerOrganizationName === "") {
      throw new Error(
        `Cannot create OMAG server configuration without Organization Name`
      );
    }

    if (!currentServerLocalUserId || currentServerLocalUserId === "") {
      throw new Error(
        `Cannot create OMAG server configuration without Local Server User ID`
      );
    }

    return {
      class: "OMAGServerConfig",
      versionId: "V2.0",
      localServerName: currentServerName,
      localServerType: currentServerLocalServerType,
      organizationName: currentServerOrganizationName,
      localServerDescription: currentServerDescription,
      localServerURL: currentServerLocalURLRoot,
      localServerUserId: currentServerLocalUserId,
      localServerPassword: currentServerLocalPassword,
      maxPageSize: currentServerMaxPageSize,
    };
  };

  const registerCohort = (
    cohortName,
    onSuccessfulRegisterCohort,
    onErrorRegisterCohort
  ) => {
    if (cohortName !== undefined) {
      console.log("called registerCohort", { cohortName });
      const registerCohortURL = encodeURI(
        "/servers/" +
          serverName +
          "/server-author/users/" +
          userId +
          "/servers/" +
          currentServerName +
          "/cohorts/" +
          cohortName
      );
      issueRestCreate(
        registerCohortURL,
        undefined,
        onSuccessfulRegisterCohort,
        onErrorRegisterCohort,
        ""
      );
    }
  };

  const unRegisterCohort = (
    cohortName,
    onSuccessfulUnRegisterCohort,
    onErrorUnRegisterCohort
  ) => {
    if (cohortName !== undefined) {
      console.log("called unRegisterCohort", { cohortName });

      const unRegisterCohortURL = encodeURI(
        "/servers/" +
          serverName +
          "/server-author/users/" +
          userId +
          "/servers/" +
          currentServerName +
          "/cohorts/" +
          cohortName
      );
      issueRestDelete(
        unRegisterCohortURL,
        onSuccessfulUnRegisterCohort,
        onErrorUnRegisterCohort
      );
    }
  };

  const enableAuditDestination = (
    auditDestinationName,
    onSuccessfulEnableAuditDestination,
    onErrorEnableAuditDestination
  ) => {
    console.log("called renableAuditDestination", { auditDestinationName });
    ///servers/{serverName}/open-metadata/view-services/server-author/users/{userId}/servers/{serverToBeConfiguredName}
    const enableAuditDestinationURL = encodeURI(
      "/servers/" +
        serverName +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
        "/audit-log-destinations/" +
        auditDestinationName
    );
    issueRestCreate(
      enableAuditDestination,
      body,
      onSuccessfulRegisterCohort,
      onErrorRegisterCohort,
      ""
    );
  };

  const clearAuditDestination = (
    auditDestinationName,
    onSuccessfulEnableAuditDestination,
    onErrorEnableAuditDestination
  ) => {
    console.log("called renableAuditDestination", { auditDestinationName });

    const clearAuditDestinationsURL = encodeURI(
      "/servers/" +
        serverName +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
        "/audit-log-destinations"
    );
    issueRestDelete(
      rclearAuditDestinationsURL,
      onSuccessfulClear,
      onErrorRegisterCohort,
      ""
    );
  };

  const configureArchiveFile = (
    archiveName,
    onSuccessfulConfigureArchiveFile,
    onErrorConfigureArchiveFile
  ) => {
    console.log("called configureArchive", { archiveName });
    const configureArchiveURL = encodeURI(
      "/servers/" +
        serverName +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
        "/open-metadata-archives/file"
    );
    issueRestGet(
      configureArchiveURL,
      onSuccessfulConfigureArchiveFile,
      onErrorConfigureArchiveFile,
      "????"
    );
  };

  const configureRepositoryProxyConnector = async (className) => {
    console.log("called configureRepositoryProxyConnector", { className });
    if (className !== "") {
      const configureRepositoryProxyConnectorURL = `/open-metadata/admin-services/users/${userId}/servers/${currentServerName}/local-repository/mode/repository-proxy/details?connectorProvider=${className}`;
      try {
        const configureRepositoryProxyConnectorURLResponse = await axios.post(
          configureRepositoryProxyConnectorURL,
          {
            serverName,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );
        if (
          configureRepositoryProxyConnectorURLResponse.data.relatedHTTPCode !==
          200
        ) {
          throw new Error(
            configureRepositoryProxyConnectorURLResponse.data.exceptionErrorMessage
          );
        }
      } catch (error) {
        if (error.code && error.code === "ECONNABORTED") {
          console.error(
            "Error connecting to the platform. Please ensure the OMAG server platform is available."
          );
        } else {
          console.error(
            "Error configuring repository proxy connector.",
            error.message
          );
        }
        throw error;
      }
    }
  };

  const configureRepositoryEventMapperConnector = async (
    className,
    eventSource
  ) => {
    console.log("called configureRepositoryEventMapperConnector", {
      className,
    });
    if (className !== "" && eventSource !== "") {
      const configureRepositoryEventMapperConnectorURL = `/open-metadata/admin-services/users/${userId}/servers/${currentServerName}/local-repository/event-mapper-details?connectorProvider=${className}&eventSource=${eventSource}`;
      try {
        const configureRepositoryEventMapperConnectorURLResponse =
          await axios.post(
            configureRepositoryEventMapperConnectorURL,
            {
              serverName,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 30000,
            }
          );
        if (
          configureRepositoryEventMapperConnectorURLResponse.data
            .relatedHTTPCode !== 200
        ) {
          throw new Error(
            configureRepositoryEventMapperConnectorURLResponse.data.exceptionErrorMessage
          );
        }
      } catch (error) {
        if (error.code && error.code === "ECONNABORTED") {
          console.error(
            "Error connecting to the platform. Please ensure the OMAG server platform is available."
          );
        } else {
          console.error(
            "Error configuring repository event mapper connector.",
            error.message
          );
        }
        throw error;
      }
    }
  };

  const configureViewServices = async (
    remoteServerURLRoot,
    remoteServerName,
    serviceURLMarker
  ) => {
    console.log("called configureViewServices", { serviceURLMarker });
    let configureViewServicesURL = `/open-metadata/admin-services/users/${userId}/servers/${currentServerName}/view-services`;
    if (serviceURLMarker && serviceURLMarker !== "") {
      configureViewServicesURL += `/${serviceURLMarker}`;
    }
    try {
      const configureViewServicesURLResponse = await axios.post(
        configureViewServicesURL,
        {
          serverName,
          config: {
            class: "ViewServiceConfig",
            omagserverPlatformRootURL: remoteServerURLRoot,
            omagserverName: remoteServerName,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      if (configureViewServicesURLResponse.data.relatedHTTPCode !== 200) {
        throw new Error(
          configureViewServicesURLResponse.data.exceptionErrorMessage
        );
      }
    } catch (error) {
      if (error.code && error.code === "ECONNABORTED") {
        console.error(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        console.error("Error configuring view services.", error.message);
      }
      throw error;
    }
  };

  /**
   * Get the config elements for this server type. These will be the steps for the wizard
   * @param {*} serverType
   * @returns an array (order is important) of config elements relevant for this type.
   */
  const serverConfigurationSteps = (serverType) => {
    // find the element in the array with the id of serverType

    const serverTypeElement = serverTypes.find((o) => o.id === serverType);

    return serverTypeElement.serverConfigElements;

    // const steps = [
    //   "Select server type",
    //   "Basic configuration",
    //   "Configure audit log destinations",
    //   "Preview configuration and deploy instance"
    // ];

    // switch(serverType) {

    //   case "View Server":
    //     steps.splice(steps.length - 1, 0, "Configure the Open Metadata View Services (OMVS)");
    //     break;

    //   case "Metadata Access Point":
    //   case "Metadata Server":
    //     steps.splice(2, 0, "Select access services");
    //     steps.splice(steps.length - 1, 0, "Register to a cohort");
    //     steps.splice(steps.length - 1, 0, "Configure the open metadata archives");
    //     break;

    //   case "Repository Proxy":
    //     steps.splice(steps.length - 1, 0, "Register to a cohort");
    //     steps.splice(steps.length - 1, 0, "Configure the open metadata archives");
    //     steps.splice(steps.length - 1, 0, "Configure the repository proxy connectors");
    //     break;

    //   case "Conformance Test Server":
    //     steps.splice(steps.length - 1, 0, "Register to a cohort");
    //     break;

    //   case "Integration Daemon":
    //     steps.splice(steps.length - 1, 0, "Configure the Open Metadata Integration Services (OMIS)");
    //     break;

    // }

    // return steps;
  };

  const setServerAttribute = async (attrEndpoint, value) => {
    console.log("called setServerAttribute", { attrEndpoint, value });
    const setServerAttrURL = `/open-metadata/admin-services/users/${userId}/servers/${currentServerName}/${attrEndpoint}=${value}`;
    try {
      const setServerAttrResponse = await axios.post(
        setServerAttrURL,
        {
          serverName,
        },
        {
          timeout: 30000,
        }
      );
      if (setServerAttrResponse.data.relatedHTTPCode !== 200) {
        throw new Error("Error in setServerAttrResponse");
      }
    } catch (error) {
      if (error.code && error.code === "ECONNABORTED") {
        console.error(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        console.error("Error configuring/updating property of OMAG Server", {
          error,
        });
      }
      throw error;
    }
  };

  const setServerConfig = (serverConfig) => {
    const serverConfigURL = encodeURI(
      "/servers/" +
        serverName +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
        "/configuration"
    );
    issueRestCreate(
      serverConfigURL,
      serverConfig,
      onSuccessfulSetServer,
      onErrorSetServer,
      "omagserverConfig"
    );
  };
  const onSuccessfulSetServer = (json) => {
    const serverConfig = json.omagserverConfig;
    setCurrentServerConfig(serverConfig);
  };
  const onErrorSetServer = (error) => {
    alert("Error setting the server config");
  };

  const showConfigForm = () => {
    document.getElementById("server-list-container").style.display = "none";
    document.getElementById("server-config-container").style.display = "flex";
    setIsCurrentStepInvalid(true);
  };

  const hideConfigForm = () => {
    document.getElementById("server-list-container").style.display = "flex";
    document.getElementById("server-config-container").style.display = "none";
    for (let el of document.querySelectorAll(".hideable"))
      el.style.display = "none";
    document.getElementById("server-type-container").style.display = "block";
    setProgressIndicatorIndex(0);
    // get the servers again
    retrieveAllServers();
  };

  return (
    <ServerAuthorContext.Provider
      value={{
        // States
        allServers,
        setAllServers,
        currentServerAuditDestinations,
        setCurrentServerAuditDestinations,
        supportedAuditLogSeverities, // we do not need expose the set as it is only referenced in this context code.
        currentServerName,
        setCurrentServerName,
        currentServerLocalURLRoot,
        setCurrentServerLocalURLRoot,
        currentServerLocalServerType,
        setCurrentServerLocalServerType,
        currentServerOrganizationName,
        setCurrentServerOrganizationName,
        currentServerDescription,
        setCurrentServerDescription,
        currentServerLocalUserId,
        setCurrentServerLocalUserId,
        currentServerLocalPassword,
        setCurrentServerLocalPassword,
        currentServerSecurityConnector,
        setCurrentServerSecurityConnector,
        currentServerRepository,
        setCurrentServerRepository,
        currentServerMaxPageSize,
        setCurrentServerMaxPageSize,
        currentServerCohorts,
        setCurrentServerCohorts,
        registerCohortName,
        setRegisterCohortName,
        unregisterCohortName,
        setUnregisterCohortName,
        currentServerOMArchives,
        setCurrentServerOMArchives,
        currentServerProxyConnector,
        setCurrentServerProxyConnector,
        currentServerEventMapperConnector,
        setCurrentServerEventMapperConnector,
        currentServerEventSource,
        setCurrentServerEventSource,

        availableAccessServices,
        setAvailableAccessServices,
        currentAccessServices,
        setCurrentAccessServices,
        unconfiguredAccessServices,
        setUnconfiguredAccessServices,
        currentAccessServiceId,
        setCurrentAccessServiceId,
        currentAccessServiceName,
        setCurrentAccessServiceName,
        currentAccessServiceOptions,
        setCurrentAccessServiceOptions,
        operationForAccessServices,
        setOperationForAccessServices,
        showAllAccessServices,
        setShowAllAccessServices,
        // Access service options
        // supported zones
        supportedZoneNames,
        setSupportedZoneNames,
        addSupportedZoneName,
        removeSupportedZoneByIndex,
        // default zones
        defaultZoneNames,
        setDefaultZoneNames,
        addDefaultZoneName,
        removeDefaultZoneByIndex,
        // publish zones
        publishZoneNames,
        setPublishZoneNames,
        addPublishZoneName,
        removePublishZoneByIndex,
        // Karma Point Plateau
        karmaPointPlateau,
        setKarmaPointPlateau,
        // Karma Point Increment
        karmaPointIncrement,
        setKarmaPointIncrement,
        // chunk
        glossaryTermLineageEventsChunkSize,
        setGlossaryTermLineageEventsChunkSize,

        availableViewServices,
        setAvailableViewServices,
        currentViewServices,
        setCurrentViewServices,

        availableIntegrationServices,
        setAvailableIntegrationServices,
        currentIntegrationServices,
        setCurrentIntegrationServices,

        availableEngineServices,
        setAvailableEngineServices,
        currentEngineServices,
        setCurrentEngineServices,

        currentServerViewServiceRemoteServerName,
        setCurrentServerViewServiceRemoteServerName,
        currentServerViewServiceRemoteServerURLRoot,
        setCurrentServerViewServiceRemoteServerURLRoot,
        activePlatforms,
        setActivePlatforms,
        setCurrentServerIntegrationServiceRemoteServerName,
        currentServerIntegrationServiceRemoteServerURLRoot,
        setCurrentServerIntegrationServiceRemoteServerURLRoot,
        currentServerIntegrationServiceConnectorName,
        setCurrentServerIntegrationServiceConnectorName,
        currentServerIntegrationServiceConnectorUserId,
        setCurrentServerIntegrationServiceConnectorUserId,
        currentServerIntegrationServiceConnection,
        setCurrentServerIntegrationServiceConnection,
        currentServerIntegrationServiceMetadataSource,
        setCurrentServerIntegrationServiceMetadataSource,
        currentServerIntegrationServiceRefreshTimeInterval,
        setCurrentServerIntegrationServiceRefreshTimeInterval,
        currentServerIntegrationServiceUsesBlockingCalls,
        setCurrentServerIntegrationServiceUsesBlockingCalls,
        currentServerIntegrationServicePermittedSynchronization,
        setCurrentServerIntegrationServicePermittedSynchronization,
        notificationType,
        setNotificationType,
        notificationTitle,
        setNotificationTitle,
        notificationSubtitle,
        setNotificationSubtitle,
        progressIndicatorIndex,
        setProgressIndicatorIndex,
        currentPlatformName,
        setCurrentPlatformName,
        loadingText,
        setLoadingText,
        currentServerConfig,
        setCurrentServerConfig,
        preventDeployment,
        setPreventDeployment,
        // Refs
        basicConfigFormStartRef,
        integrationServicesFormStartRef,
        // Functions
        cleanForcurrentServerType,
        retrieveAllServers,
        fetchServerConfig,
        generateBasicServerConfig,
        registerCohort,
        unRegisterCohort,
        configureArchiveFile,
        configureRepositoryProxyConnector,
        configureRepositoryEventMapperConnector,
        configureViewServices,
        serverConfigurationSteps,
        setServerAttribute,
        setServerConfig,
        showConfigForm,
        hideConfigForm,
        isCurrentStepInvalid,
        setIsCurrentStepInvalid
      }}
    >
      {props.children}
    </ServerAuthorContext.Provider>
  );
};

ServerAuthorContextProvider.propTypes = {
  children: PropTypes.node,
};

export default ServerAuthorContextProvider;
