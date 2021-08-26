/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";
import {
  CodeSnippet,
  Column,
  Grid,
  InlineNotification,
  Loading,
  Row,
  TileGroup,
  RadioTile,
} from "carbon-components-react";
import axios from "axios";
import { issueRestCreate } from "../../common/RestCaller";

import { IdentificationContext } from "../../../contexts/IdentificationContext";
import { ServerAuthorContext } from "../contexts/ServerAuthorContext";
import serverTypes from "./defaults/serverTypes";

import AllServers from "./AllServers";
import ConfigurationSteps from "./ConfigurationSteps";
import NavigationButtons from "./NavigationButtons";
import BasicConfig from "./BasicConfig";
import ConfigureAccessServices from "./ConfigureAccessServices";
import ConfigureAuditLog from "./ConfigureAuditLog";
import RegisterCohorts from "./RegisterCohorts";
import ConfigureOMArchives from "./ConfigureOMArchives";
import ConfigureRepositoryProxyConnectors from "./ConfigureRepositoryProxyConnectors";
import ConfigureViewServices from "./ConfigureViewServices";
import ConfigureDiscoveryEngines from "./ConfigureDiscoveryEngines";
import ConfigureStewardshipEngines from "./ConfigureStewardshipEngines";
import ConfigureIntegrationServices from "./ConfigureIntegrationServices";
import ConfigPreview from "./ConfigPreview";

export default function ServerAuthorWizard() {
  const { userId, serverName: tenantId } = useContext(IdentificationContext);
  console.log(useContext(ServerAuthorContext));
  const {
    supportedAuditLogSeverities,
    newServerName,
    newServerLocalServerType,
    setNewServerLocalServerType,
    newServerSecurityConnector,
    availableAccessServices,
    selectedAccessServices,
    newServerRepository,
    newServerCohorts,
    newServerOMArchives,
    newServerProxyConnector,
    newServerEventMapperConnector,
    newServerEventSource,
    availableViewServices,
    selectedViewServices,
    newServerViewServiceRemoteServerURLRoot,
    newServerViewServiceRemoteServerName,
    selectedDiscoveryEngines,
    newServerDiscoveryEngineRemoteServerName,
    newServerDiscoveryEngineRemoteServerURLRoot,
    selectedStewardshipEngines,
    newServerStewardshipEngineRemoteServerName,
    newServerStewardshipEngineRemoteServerURLRoot,
    notificationType,
    setNotificationType,
    notificationTitle,
    setNotificationTitle,
    notificationSubtitle,
    setNotificationSubtitle,
    progressIndicatorIndex,
    setProgressIndicatorIndex,
    loadingText,
    setLoadingText,
    setNewServerConfig,
    basicConfigFormStartRef,
    discoveryEnginesFormStartRef,
    stewardshipEnginesFormStartRef,
    fetchServerConfig,
    generateBasicServerConfig,
    registerCohort,
    // configureAccessServices,
    configureArchiveFile,
    configureRepositoryProxyConnector,
    configureRepositoryEventMapperConnector,
    configureViewServices,
    configureDiscoveryEngineClient,
    configureDiscoveryEngines,
    configureStewardshipEngineClient,
    configureStewardshipEngines,
    serverConfigurationSteps,
  } = useContext(ServerAuthorContext);

  // Navigation

  const sectionMapping = {
    ["Select server type"]: "server-type-container",
    ["Basic configuration"]: "config-basic-container",
    ["Configure audit log destinations"]: "audit-log-container",
    ["Configure local repository"]: "local-repository-container",
    ["Preview configuration and deploy instance"]: "config-preview-container",
    ["Select access services"]: "access-services-container",
    ["Register to a cohort"]: "cohort-container",
    ["Configure the open metadata archives"]: "archives-container",
    ["Configure the repository proxy connectors"]: "repository-proxy-container",
    ["Configure the Open Metadata View Services (OMVS)"]: "view-services-container",
    ["Configure the Open Metadata Integration Services (OMIS)"]: "integration-daemon-container",

  };

  const showPreviousStep = () => {
    const steps = serverConfigurationSteps(newServerLocalServerType);
    if (progressIndicatorIndex === 0) {
      return null;
    }
    const previous = steps[progressIndicatorIndex - 1];
    for (let el of document.querySelectorAll(".hideable"))
      el.style.display = "none";
    document.getElementById(sectionMapping[previous]).style.display = "block";
  };

  const showNextStep = () => {
    const steps = serverConfigurationSteps(newServerLocalServerType);
    if (progressIndicatorIndex === steps.length) {
      return null;
    }
    const next = steps[progressIndicatorIndex + 1];
    for (let el of document.querySelectorAll(".hideable"))
      el.style.display = "none";
    document.getElementById(sectionMapping[next]).style.display = "block";
    switch (next) {
      case "Basic configuration":
        basicConfigFormStartRef.current.focus();
        break;
      case "Configure the discovery engine services":
        discoveryEnginesFormStartRef.current.focus();
        break;
      case "Configure the stewardship engine services":
        stewardshipEnginesFormStartRef.current.focus();
        break;
    }
  };

  const handleBackToPreviousStep = (e) => {
    e.preventDefault();
    showPreviousStep();
    setProgressIndicatorIndex(progressIndicatorIndex - 1);
  };

  // Server Type

  const handleServerTypeSelection = async (e) => {
    e.preventDefault();
    showNextStep();
    setProgressIndicatorIndex(progressIndicatorIndex + 1);
  };

  // Basic Config

  const handleBasicConfig = async (e) => {
    e.preventDefault();
    // Generate server config
    setLoadingText("Generating server configuration...");
    document.getElementById("config-basic-container").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    let serverConfig;
    try {
      serverConfig = generateBasicServerConfig();
    } catch (error) {
      console.error("Error generating server config", { error });
      setNotificationType("error");
      setNotificationTitle("Configuration Error");
      setNotificationSubtitle(
        "Error generating OMAG server configuration file. " + error.message
      );
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("config-basic-container").style.display = "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Post server config
    setLoadingText(
      "Storing basic server configuration on OMAG server platform..."
    );
    // const setServerConfigURL = `/open-metadata/admin-services/users/${userId}/servers/${newServerName}/configuration`;
    const newServerName = serverConfig.localServerName;
    const serverConfigURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/configuration"
    );
    issueRestCreate(
      serverConfigURL,
      serverConfig,
      onSuccessfulConfigureServer,
      onErrorConfigureServer,
      "omagServerConfig"
    );
  };
  const onSuccessfulConfigureServer = (json) => {
    const serverConfig = json.omagServerConfig;
    setNewServerConfig(serverConfig);
    // Enable chosen repository
    if (newServerLocalServerType === "Metadata Server") {
      setLoadingText("Enabling chosen local repository...");
      const newServerName = serverConfig.localServerName;
      const serverConfigURL = encodeURI(
        "/servers/" +
          tenantId +
          "/server-author/users/" +
          userId +
          "/servers/" +
          newServerName +
          "/local-repository/mode/" +
          newServerRepository
      );
      issueRestCreate(
        serverConfigURL,
        serverConfig,
        onSuccessfulEnableRepository,
        onErrorConfigureServer,
        "omagServerConfig"
      );
    } else {
      // TODO handle the other server types
      alert(
        "Server Author does not yet support server type " +
          newServerLocalServerType
      );
    }
  };
  const onErrorConfigureServer = (error) => {
    console.error("Error sending config to platform", { error });
    setNewServerConfig(null);
    setNotificationType("error");
    if (error.code && error.code === "ECONNABORTED") {
      setNotificationTitle("Connection Error");
      setNotificationSubtitle(
        "Error connecting to the platform. Please ensure the OMAG server platform is available."
      );
    } else {
      setNotificationTitle("Configuration Error");
      setNotificationSubtitle(
        "Error sending server configuration to the platform."
      );
    }
    document.getElementById("loading-container").style.display = "none";
    document.getElementById("config-basic-container").style.display = "block";
    document.getElementById("notification-container").style.display = "block";
  };

  const onSuccessfulEnableRepository = (json) => {
    const serverConfig = json.omagServerConfig;
    setNewServerConfig(serverConfig);
    // Configure event bus
    setLoadingText("Configuring event bus...");
    const newServerName = serverConfig.localServerName;
    const serverConfigURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/event-bus?topicURLRoot=egeriaTopics"
    );
    issueRestCreate(
      serverConfigURL,
      serverConfig,
      onSuccessfulConfigureEventBusURL,
      onErrorConfigureServer,
      "omagServerConfig"
    );
  };
  const onSuccessfulConfigureEventBusURL = (json) => {
    const serverConfig = json.omagServerConfig;
    setNewServerConfig(serverConfig);
    // Configure security connector
    if (newServerSecurityConnector !== "") {
      setLoadingText("Configuring security connector...");
      const serverConfigURL = encodeURI(
        "/servers/" +
          tenantId +
          "/server-author/users/" +
          userId +
          "/servers/" +
          newServerName +
          "/security/connection"
      );
      config = {
        class: "Connection",
        connectorType: {
          class: "ConnectorType",
          connectorProviderClassName: newServerSecurityConnector,
        },
      };
      issueRestCreate(
        serverConfigURL,
        serverConfig,
        onSuccessfulConfigurationOfSecurityConnector,
        onErrorConfigureServer,
        "omagServerConfig"
      );
    } else {
      directUserToNextStep();
    }
  };

  const onSuccessfulConfigurationOfSecurityConnector = (json) => {
    const serverConfig = json.omagServerConfig;
    setNewServerConfig(serverConfig);
    directUserToNextStep();
  };
  const directUserToNextStep = () => {
    // Direct User to Next Step
    showNextStep();
    setProgressIndicatorIndex(progressIndicatorIndex + 1);
  };

  // Access Services (optional)
  const handleAccessServicesConfig = () => {
    setLoadingText("Enabling access services...");
    document.getElementById("access-services-container").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Enable Access Services
    // try {
      if (selectedAccessServices.length === availableAccessServices.length) {
        configureAccessServices();
      } else {
        for (const service of selectedAccessServices) {
          setLoadingText(`Enabling ${service} access service...`);
          configureAccessServices(service);
        }
      }
  };
  const configureAccessServices = (serviceURLMarker) => {
    console.log("called configureAccessServices", { serviceURLMarker });
    let configureAccessServicesURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        newServerName +
        "/access-services"
    );
    if (serviceURLMarker && serviceURLMarker !== "") {
      configureAccessServicesURL += "/" + serviceURLMarker;
    }

    issueRestCreate(
      configureAccessServicesURL,
      {},    // TODO supply appropriate access service options here - for example supported or default zones for asset orientated OMAS's   
      onSuccessfulConfigureAccessServices,
      onErrorConfigureServer,
      "omagServerConfig"
    );
  }
  const onSuccessfulConfigureAccessServices = (json) => {
    const serverConfig = json.omagServerConfig;
    setNewServerConfig(serverConfig);
    configureAuditLogDestinations();
  }

  // Audit Log Destinations

  const configureAuditLogDestinations = () => {
    setLoadingText("Configuring audit log destinations...");
    document.getElementById("audit-log-container").style.display = "none";
    document.getElementById("loading-container").style.display = "block";

    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
    
  };
  const onSuccessfulFetchServer  = (json) => {
    const serverConfig = json.serverConfig;
    setNewServerConfig(serverConfig)
    showNextStep();
    setProgressIndicatorIndex(progressIndicatorIndex + 1);
    document.getElementById("loading-container").style.display = "none";
    document.getElementById("cohort-container").style.display = "block";
    document.getElementById("notification-container").style.display = "block";
  
  } 
  const onErrorFetchServer  = (error) => {
    console.error("Error fetching config", { error });
    setNewServerConfig(null);
    setNotificationType("error");
    if (error.code && error.code === "ECONNABORTED") {
      setNotificationTitle("Connection Error");
      setNotificationSubtitle(
        "Error connecting to the platform. Please ensure the OMAG server platform is available."
      );
    } else {
      setNotificationTitle("Error fetching the configuration");
      setNotificationSubtitle(
        "Error getting server configuration from platform."
      );
    }
    document.getElementById("loading-container").style.display = "none";
    document.getElementById("config-basic-container").style.display = "block";
    document.getElementById("notification-container").style.display = "block";
  } 

  
  const onSuccessfulAuditLog = (json) => {
      alert("Successful audit log configure)");
      // TODO amend context to remove audit log we have just configured.
  };
  const onErrorAuditLog = (json) => {
    alert("Error audit log configure)");
  };

  // Optional Steps

  // Register to a cohort

  const handleRegisterCohorts =  () => {
    setLoadingText("Registering cohort(s)...");
    document.getElementById("cohort-container").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Register Cohorts
    // for (const cohortName of newServerCohorts) {
    //   try {
    //     setLoadingText(
    //       `Registering the OMAG Server to the ${cohortName} cohort...`
    //     );
    //     await registerCohort(cohortName);
    //   } catch (error) {
    //     console.error(
    //       `Error registering the OMAG Server to the ${cohortName} cohort`,
    //       { error }
    //     );
    //     setNotificationType("error");
    //     if (error.code && error.code === "ECONNABORTED") {
    //       setNotificationTitle("Connection Error");
    //       setNotificationSubtitle(
    //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
    //       );
    //     } else {
    //       setNotificationTitle("Configuration Error");
    //       setNotificationSubtitle(
    //         `Error registering the OMAG Server to the ${cohortName} cohort`
    //       );
    //     }
    //     document.getElementById("loading-container").style.display = "none";
    //     document.getElementById("cohort-container").style.display = "block";
    //     document.getElementById("notification-container").style.display =
    //       "block";
    //     return;
    //   }
    // }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    fetchServerConfig(onSuccessfulFetchServer, onErrorFetchServer);
  };

  // Configure open metadata archives to load on server startup

  const handleConfigureArchives = async () => {
    setLoadingText("Configuring archives(s) to load on server startup...");
    document.getElementById("archives-container").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Register Cohorts
    for (const archiveName of newServerOMArchives) {
      try {
        setLoadingText(
          `Configuring the OMAG Server to load the ${archiveName} archive upon startup...`
        );
        await configureArchiveFile(archiveName); // TODO
      } catch (error) {
        console.error(
          `Error configuring the OMAG Server to load the ${archiveName} archive upon startup`,
          { error }
        );
        setNotificationType("error");
        if (error.code && error.code === "ECONNABORTED") {
          setNotificationTitle("Connection Error");
          setNotificationSubtitle(
            "Error connecting to the platform. Please ensure the OMAG server platform is available."
          );
        } else {
          setNotificationTitle("Configuration Error");
          setNotificationSubtitle(
            `Error configuring the OMAG Server to load the ${archiveName} archive upon startup.`
          );
        }
        document.getElementById("loading-container").style.display = "none";
        document.getElementById("archives-container").style.display = "block";
        document.getElementById("notification-container").style.display =
          "block";
        return;
      }
    }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    try {
      const serverConfig = await fetchServerConfig();
      setNewServerConfig(serverConfig);
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
    } catch (error) {
      console.error("error fetching server config", { error });
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(`Error fetching configuration for the server.`);
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("archives-container").style.display = "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  // Configure the Repository Proxy Connectors

  const handleConfigureRepositoryProxyConnectors = async () => {
    // If all three fields are blank, skip to next step
    if (
      (!newServerProxyConnector || newServerProxyConnector === "") &&
      (!newServerEventMapperConnector ||
        newServerEventMapperConnector === "") &&
      (!newServerEventSource || newServerEventSource === "")
    ) {
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
      return;
    }
    // If one or two fields are blank, show notification
    if (
      !newServerProxyConnector ||
      newServerProxyConnector === "" ||
      !newServerEventMapperConnector ||
      newServerEventMapperConnector === "" ||
      !newServerEventSource ||
      newServerEventSource === ""
    ) {
      setNotificationType("error");
      setNotificationTitle("Input Error");
      setNotificationSubtitle(
        `All three fields are required to configure the repository proxy connector. Leave all three fields blank to skip this step.`
      );
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    setLoadingText("Configuring repository proxy connector...");
    document.getElementById("repository-proxy-container").style.display =
      "none";
    document.getElementById("loading-container").style.display = "block";
    // Configure the repository proxy connector
    try {
      await configureRepositoryProxyConnector(newServerProxyConnector);
    } catch (error) {
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(
          `Error configuring the repository proxy connector. Please ensure the fully qualified repository proxy connectory name is correct.`
        );
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("repository-proxy-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Configure the repository event mapper connector
    setLoadingText("Configuring repository event mapper connector...");
    try {
      await configureRepositoryEventMapperConnector(
        newServerEventMapperConnector,
        newServerEventSource
      );
    } catch (error) {
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(
          `Error configuring the repository event mapper connector. Please ensure the fully qualified repository event mapper connector name and event source are correct.`
        );
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("repository-proxy-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    try {
      const serverConfig = await fetchServerConfig();
      setNewServerConfig(serverConfig);
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
    } catch (error) {
      console.error("error fetching server config", { error });
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(`Error fetching configuration for the server.`);
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("repository-proxy-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  // Configure the open metadata view services

  const handleConfigureViewServices = async () => {
    // If all three fields are blank, skip to next step
    if (
      (!newServerViewServiceRemoteServerURLRoot ||
        newServerViewServiceRemoteServerURLRoot === "") &&
      (!newServerViewServiceRemoteServerName ||
        newServerViewServiceRemoteServerName === "") &&
      (!selectedViewServices || !selectedViewServices.length)
    ) {
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
      return;
    }
    // If one or two fields are blank, show notification
    if (
      !newServerViewServiceRemoteServerURLRoot ||
      newServerViewServiceRemoteServerURLRoot === "" ||
      !newServerViewServiceRemoteServerName ||
      newServerViewServiceRemoteServerName === "" ||
      !selectedViewServices ||
      !selectedViewServices.length
    ) {
      setNotificationType("error");
      setNotificationTitle("Input Error");
      setNotificationSubtitle(
        `All three fields are required to configure the repository proxy connector. Leave all three fields blank to skip this step.`
      );
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    setLoadingText("Enabling view services...");
    document.getElementById("view-services-container").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Enable View Services
    try {
      if (selectedViewServices.length === availableViewServices.length) {
        configureViewServices(
          newServerViewServiceRemoteServerURLRoot,
          newServerViewServiceRemoteServerName
        );
      } else {
        for (const service of selectedViewServices) {
          setLoadingText(`Enabling ${service} view service...`);
          configureViewServices(
            newServerViewServiceRemoteServerURLRoot,
            newServerViewServiceRemoteServerName,
            service
          );
        }
      }
    } catch (error) {
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(`Error enabling the view service(s).`);
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("view-services-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    try {
      const serverConfig = await fetchServerConfig();
      setNewServerConfig(serverConfig);
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
    } catch (error) {
      console.error("error fetching server config", { error });
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(`Error fetching configuration for the server.`);
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("view-services-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  // Configure the Discovery Engines

  const handleConfigureDiscoveryEngines = async () => {
    // If all three fields are blank, skip to next step
    if (
      (!newServerDiscoveryEngineRemoteServerURLRoot ||
        newServerDiscoveryEngineRemoteServerURLRoot === "") &&
      (!newServerDiscoveryEngineRemoteServerName ||
        newServerDiscoveryEngineRemoteServerName === "") &&
      (!selectedDiscoveryEngines || !selectedDiscoveryEngines.length)
    ) {
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
      return;
    }
    // If one or two fields are blank, show notification
    if (
      !newServerDiscoveryEngineRemoteServerURLRoot ||
      newServerDiscoveryEngineRemoteServerURLRoot === "" ||
      !newServerDiscoveryEngineRemoteServerName ||
      newServerDiscoveryEngineRemoteServerName === "" ||
      !selectedDiscoveryEngines ||
      !selectedDiscoveryEngines.length
    ) {
      setNotificationType("error");
      setNotificationTitle("Input Error");
      setNotificationSubtitle(
        `All three fields are required to configure the discovery engine. Leave all three fields blank to skip this step.`
      );
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    setLoadingText("Configuring discovery engine client...");
    document.getElementById("discovery-engines-container").style.display =
      "none";
    document.getElementById("loading-container").style.display = "block";
    // Configure the discovery engines client
    try {
      await configureDiscoveryEngineClient(
        newServerDiscoveryEngineRemoteServerURLRoot,
        newServerDiscoveryEngineRemoteServerName
      );
    } catch (error) {
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(
          `Error configuring the discovery engine client. Please ensure the metadata server root URL and name are correct.`
        );
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("discovery-engines-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Configure the discovery engines
    setLoadingText("Configuring discovery engines...");
    try {
      await configureDiscoveryEngines(selectedDiscoveryEngines);
    } catch (error) {
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(
          `Error configuring the discovery engines. ${error.message}`
        );
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("discovery-engines-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    try {
      const serverConfig = await fetchServerConfig();
      setNewServerConfig(serverConfig);
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
    } catch (error) {
      console.error("error fetching server config", { error });
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(`Error fetching configuration for the server.`);
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("discovery-engines-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  // Configure the Stewardship Engines

  const handleConfigureStewardshipEngines = async () => {
    console.log({
      newServerStewardshipEngineRemoteServerURLRoot,
      newServerStewardshipEngineRemoteServerName,
      selectedStewardshipEngines,
    });
    // If all three fields are blank, skip to next step
    if (
      (!newServerStewardshipEngineRemoteServerURLRoot ||
        newServerStewardshipEngineRemoteServerURLRoot === "") &&
      (!newServerStewardshipEngineRemoteServerName ||
        newServerStewardshipEngineRemoteServerName === "") &&
      (!selectedStewardshipEngines || !selectedStewardshipEngines.length)
    ) {
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
      return;
    }
    // If one or two fields are blank, show notification
    if (
      !newServerStewardshipEngineRemoteServerURLRoot ||
      newServerStewardshipEngineRemoteServerURLRoot === "" ||
      !newServerStewardshipEngineRemoteServerName ||
      newServerStewardshipEngineRemoteServerName === "" ||
      !selectedStewardshipEngines ||
      !selectedStewardshipEngines.length
    ) {
      setNotificationType("error");
      setNotificationTitle("Input Error");
      setNotificationSubtitle(
        `All three fields are required to configure the stewardship engine. Leave all three fields blank to skip this step.`
      );
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    setLoadingText("Configuring stewardship engine client...");
    document.getElementById("stewardship-engines-container").style.display =
      "none";
    document.getElementById("loading-container").style.display = "block";
    // Configure the stewardship engines client
    try {
      await configureStewardshipEngineClient(
        newServerStewardshipEngineRemoteServerURLRoot,
        newServerStewardshipEngineRemoteServerName
      );
    } catch (error) {
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(
          `Error configuring the stewardship engine client. Please ensure the metadata server root URL and name are correct.`
        );
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("stewardship-engines-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Configure the stewardship engines
    setLoadingText("Configuring stewardship engines...");
    try {
      await configureStewardshipEngines(selectedStewardshipEngines);
    } catch (error) {
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(
          `Error configuring the stewardship engines. ${error.message}`
        );
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("stewardship-engines-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    try {
      const serverConfig = await fetchServerConfig();
      setNewServerConfig(serverConfig);
      showNextStep();
      setProgressIndicatorIndex(progressIndicatorIndex + 1);
    } catch (error) {
      console.error("error fetching server config", { error });
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Configuration Error");
        setNotificationSubtitle(`Error fetching configuration for the server.`);
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("stewardship-engines-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  // Config Preview

  const handleDeployConfig = async (e) => {
    e.preventDefault();
    setLoadingText("Deploying OMAG server from stored configuration...");
    document.getElementById("config-preview-container").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Issue the instance call to start the new server
    const startServerURL = `/open-metadata/admin-services/users/${userId}/servers/${newServerName}/instance`;
    try {
      const startServerResponse = await axios.post(
        startServerURL,
        {
          config: "",
          tenantId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      if (startServerResponse.data.relatedHTTPCode === 200) {
        setNotificationType("success");
        setNotificationTitle("Success!");
        setNotificationSubtitle(`Server instance deployed from configuration.`);
        document.getElementById("loading-container").style.display = "none";
        document.getElementById("notification-container").style.display =
          "block";
        document.getElementById("server-list-container").style.display = "flex";
      } else {
        console.error(startServerResponse.data);
        throw new Error("Error in startServerResponse");
      }
    } catch (error) {
      console.error("Error starting server from stored config", { error });
      setNotificationType("error");
      if (error.code && error.code === "ECONNABORTED") {
        setNotificationTitle("Connection Error");
        setNotificationSubtitle(
          "Error connecting to the platform. Please ensure the OMAG server platform is available."
        );
      } else {
        setNotificationTitle("Deployment Error");
        setNotificationSubtitle(
          `Error starting server from stored configuration file.`
        );
      }
      document.getElementById("loading-container").style.display = "none";
      document.getElementById("config-preview-container").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  const firstRowIds = ['omag-server'];
  const secondRowIds = ['cohort-member', 'view-server', 'governance-server'];
  const thirdRowLeftIds = ['metadata-server', 'metadata-access-point','repository-proxy', 'conformance-test-server' ];
  const thirdRowRightIds = ['integration-daemon', 'engine-host', 'data-engine-proxy', 'open-lineage-server'];

  // filter the types 
  const firstRowServerTypes =  serverTypes.filter( i => firstRowIds.includes( i.id ) );
  const secondRowServerTypes = serverTypes.filter( i => secondRowIds.includes( i.id ) );
  const thirdRowLeftServerTypes = serverTypes.filter( i => thirdRowLeftIds.includes( i.id ) );
  const thirdRowRightServerTypes = serverTypes.filter( i => thirdRowRightIds.includes( i.id ) );

  const serverTypeTiles = serverTypes.map((serverType, i) => {
    return (
        <RadioTile
        id={serverType.id}
        key={`server-type-${i}`}
        light={false}
        name={`server-serverType-${i}`}
        tabIndex={i}
        value={serverType.label}
        className="server-type-card"
      >
        {serverType.label}
      </RadioTile>
     
    );
  });

  const firstRowServerTypeTiles = firstRowServerTypes.map((serverType, i) => {
    return (
        <RadioTile
        id={serverType.id}
        key={`server-type-${i}`}
        light={false}
        name={`server-serverType-${i}`}
        tabIndex={i}
        value={serverType.label}
        className="server-type-card"
      >
        {serverType.label}
      </RadioTile>
     
    );
  });
  const secondRowServerTypeTiles = secondRowServerTypes.map((serverType, i) => {
    return (
        <RadioTile
        id={serverType.id}
        key={`server-type-${i}`}
        light={false}
        name={`server-serverType-${i}`}
        tabIndex={i}
        value={serverType.label}
        className="server-type-card"
      >
        {serverType.label}
      </RadioTile>
     
    );
  });
  const thirdRowLeftServerTypeTiles = thirdRowLeftServerTypes.map((serverType, i) => {
    return (
 
        <RadioTile
        id={serverType.id}
        key={`server-type-${i}`}
        light={false}
        name={`server-serverType-${i}`}
        tabIndex={i}
        value={serverType.label}
        className="server-type-card"
      >
        {serverType.label}
      </RadioTile>
     
    );
  });
  const thirdRowRightServerTypeTiles = thirdRowRightServerTypes.map((serverType, i) => {
    return (
 
        <RadioTile
        id={serverType.id}
        key={`server-type-${i}`}
        light={false}
        name={`server-serverType-${i}`}
        tabIndex={i}
        value={serverType.label}
        className="server-type-card"
      >
        {serverType.label}
      </RadioTile>
     
    );
  });

  return (
    <Grid>
      <Row id="server-list-container">
        <Column
          id="server-list"
          sm={{ span: 8 }}
          md={{ span: 8 }}
          lg={{ span: 16 }}
        >
          <h1>All OMAG Servers</h1>
  
          <AllServers />
        </Column>
      </Row>

      <Row id="server-config-container" className="flex-column" style={{ display: "none" }}>
        {/* Form Column */}
       {/* Progress Indicator Column */}
       <h1>Create New OMAG Server</h1>

       <Row
          id="config-progress-container"
          sm={{ span: 4 }}
          md={{ span: 2 }}
          lg={{ span: 4 }}
        >
          <ConfigurationSteps />
        </Row>
        <Column
          id="server-config-forms"
          sm={{ span: 4 }}
          md={{ span: 6 }}
          lg={{ span: 12 }}
        >

          <div
            id="notification-container"
            className="hideable"
            style={{ display: "none" }}
          >
            <InlineNotification
              kind={notificationType}
              title={notificationTitle}
              subtitle={notificationSubtitle}
              hideCloseButton={true}
              timeout={10}
            />
          </div>

          <div id="server-type-container" className="hideable">
          <NavigationButtons handleNextStep={handleServerTypeSelection} />
            <h4 style={{ textAlign: "left", marginBottom: "32px" }}>
              Select Server Type
            </h4>
            <TileGroup
              defaultSelected={serverTypes[0].label}
              name="server-types-omag-server"
              valueSelected=""
              onChange={(value) => setNewServerLocalServerType(value)}
              // className="server-type-container"
            >
            {/* <div className="server-type-container">
              {thirdRowLeftServerTypeTiles}
              </div> */}
              {serverTypeTiles}
            </TileGroup>
           
          </div>

          <div
            id="config-basic-container"
            className="hideable"
            style={{ display: "none" }}
          >
             <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleBasicConfig}
            />
            <h4 style={{ textAlign: "left", marginBottom: "16px" }}>
              Basic Configuration
            </h4>
            <BasicConfig />
           
          </div>

          <div
            id="access-services-container"
            className="hideable"
            style={{ display: "none" }}
          >
              <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleAccessServicesConfig}
            />
            <h4 style={{ textAlign: "left", marginBottom: "24px" }}>
              Select Access Services
            </h4>
            <ConfigureAccessServices />
          
          </div>

          <div
            id="audit-log-container"
            className="hideable"
            style={{ display: "none" }}
          >
            <h4 style={{ textAlign: "left", marginBottom: "24px" }}>
              Configure Audit Log Destinations
            </h4>
            <ConfigureAuditLog
              nextAction={() =>
                configureAuditLogDestinations()
              }
              previousAction={handleBackToPreviousStep}
            />
          </div>

          <div
            id="cohort-container"
            className="hideable"
            style={{ display: "none" }}
          >
             <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleRegisterCohorts}
            />
            <h4 style={{ textAlign: "left", marginBottom: "24px" }}>
              Register to the following cohort(s):
            </h4>
            <RegisterCohorts />
           
          </div>

          <div
            id="archives-container"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleConfigureArchives}
            />
            <h4 style={{ textAlign: "left", marginBottom: "24px" }}>
              Configure the Open Metadata Archives that are loaded on server
              startup
            </h4>
            <ConfigureOMArchives />
            
          </div>

          <div
            id="repository-proxy-container"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleConfigureRepositoryProxyConnectors}
            />
            <h4 style={{ textAlign: "left", marginBottom: "24px" }}>
              Configure the Repository Proxy Connectors
            </h4>
            <ConfigureRepositoryProxyConnectors />
            
          </div>

          <div
            id="view-services-container"
            className="hideable"
            style={{ display: "none" }}
          >
             <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleConfigureViewServices}
            />
            <h4 style={{ textAlign: "left", marginBottom: "24px" }}>
              Configure the Open Metadata View Services (OMVS)
            </h4>
            <ConfigureViewServices />
           
          </div>

          <div
            id="integration-daemon-container"
            className="hideable"
            style={{ display: "none" }}
          >
              <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={showNextStep}
            />
            <h4 style={{ textAlign: "left", marginBottom: "24px" }}>
              Configure the Open Metadata Integration Services (OMIS)
            </h4>
            <ConfigureIntegrationServices />
          
          </div>

          <div
            id="config-preview-container"
            className="hideable"
            style={{ display: "none" }}
          >
            <h4
              style={{
                textAlign: "left",
                marginBottom: "4px",
                marginLeft: "1rem",
              }}
            >
              Preview Configuration
            </h4>
            <ConfigPreview options={{ editable: true }} />
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleDeployConfig}
            />
          </div>

          <div
            id="loading-container"
            className="hideable"
            style={{ display: "none" }}
          >
            <Loading
              description="Active loading indicator"
              withOverlay={false}
              style={{ margin: "auto" }}
            />
            <p>{loadingText}</p>
          </div>
        </Column>

      </Row>
    </Grid>
  );
}
