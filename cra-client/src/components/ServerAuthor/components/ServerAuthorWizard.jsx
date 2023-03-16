/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useState } from "react";
import {
  Column,
  Grid,
  InlineNotification,
  Loading,
  Row,
  Select,
  SelectItem,
  SelectItemGroup,
} from "carbon-components-react";
import Info16 from "@carbon/icons-react/lib/information/16";
import { issueRestCreate } from "../../common/RestCaller";

import { IdentificationContext } from "../../../contexts/IdentificationContext";
import { ServerAuthorContext } from "../contexts/ServerAuthorContext";
import serverTypes from "./defaults/serverTypes";

import AllServers from "./AllServers";
import ConfigurationSteps from "./ConfigurationSteps";
import NavigationButtons from "./NavigationButtons";
import BasicConfig from "./BasicConfig";
import ConfigureAccessServices from "./accessServices/ConfigureAccessServices";
import ConfigureLocalRepository from "./ConfigureLocalRepository";
import ConfigureAuditLogDestinations from "./ConfigureAuditLogDestinations";
import RegisterCohorts from "./RegisterCohorts";
import ConfigureOMArchives from "./ConfigureOMArchives";
import ConfigureRepositoryProxyConnectors from "./ConfigureRepositoryProxyConnectors";
import ConfigureViewServices from "./ConfigureViewServices";
import ConfigureIntegrationServices from "./ConfigureIntegrationServices";
import serverConfigElements from "./defaults/serverConfigElements";

export default function ServerAuthorWizard() {
  const { userId, serverName: tenantId } = useContext(IdentificationContext);
  console.log(useContext(ServerAuthorContext));
  const {
    currentServerName,
    currentServerLocalServerType,
    setCurrentServerLocalServerType,
    currentServerSecurityConnector,
    selectedAccessServices,
    currentServerRepository,
    currentServerOMArchives,
    currentServerProxyConnector,
    currentServerEventMapperConnector,
    currentServerEventSource,
    selectedViewServices,
    currentServerViewServiceRemoteServerURLRoot,
    currentServerViewServiceRemoteServerName,
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
    currentServerConfig,
    setCurrentServerConfig,
    setCurrentAccessServices,
    activePlatforms,
    newPlatformName,
    // available services for this servers platforms.
    setAvailableAccessServices,
    setAvailableEngineServices,
    setAvailableViewServices,
    setAvailableIntegrationServices,
    setUnconfiguredAccessServices,
    unconfiguredAccessServices,

    // functions
    cleanForcurrentServerType,
    fetchServerConfig,
    generateBasicServerConfig,
    configureArchiveFile,
    configureRepositoryProxyConnector,
    configureRepositoryEventMapperConnector,
    configureViewServices,
    serverConfigurationSteps,
    // setServerTypeDescription,
    // serverTypeDescription
    setIsCurrentStepInvalid
  } = useContext(ServerAuthorContext);

  const [serverTypeDescription, setServerTypeDescription] = useState();


  const displayHelpForServerTypes = () => {
    window.open(
      "https://egeria-project.org/concepts/omag-server/?h=omag+server+types",
      "_blank"
    );
  };

  const showPreviousStep = () => {
    if (progressIndicatorIndex === 0) {
      return null;
    }
    const steps = serverConfigurationSteps(currentServerLocalServerType);
    // hide everything that is hideable
    for (let el of document.querySelectorAll(".hideable"))
      el.style.display = "none";
    // previous configElement
    const previousStep = steps[progressIndicatorIndex - 1];
    // this has been coded so that the configElement identifier is the same as the html id of the associated section we want to show
    // for example a config element with id audit-log-config-element with have a html section with that name.
    document.getElementById(previousStep).style.display = "block";
  };

  const showNextStep = () => {
    const steps = serverConfigurationSteps(currentServerLocalServerType);
    if (progressIndicatorIndex === steps.length) {
      return null;
    }
    // hide everything that is hideable
    for (let el of document.querySelectorAll(".hideable"))
      el.style.display = "none";
    const nextStep = steps[progressIndicatorIndex + 1];

    document.getElementById(nextStep).style.display = "block";
    // switch (next) {
    //   case "Basic configuration":
    //     basicConfigFormStartRef.current.focus();
    //     break;
    // case "Configure the discovery engine services":
    //   discoveryEnginesFormStartRef.current.focus();
    //   break;
    // case "Configure the stewardship engine services":
    //   stewardshipEnginesFormStartRef.current.focus();
    //   break;
    // }
    const id = steps[progressIndicatorIndex + 1];
    console.log('id='+id);
    const serverTypeElement = serverConfigElements.find(o => o.id === id); 
    // disable the next step if necessary
    setIsCurrentStepInvalid(serverTypeElement.initialiseAsInvalid);
    setProgressIndicatorIndex(progressIndicatorIndex + 1);
  };

  const handleBackToPreviousStep = (e) => {
    e.preventDefault();
    showPreviousStep();
    setProgressIndicatorIndex(progressIndicatorIndex - 1);
  };

  // Server Type

  const handleServerTypeSelection = async (e) => {
    e.preventDefault();
    // clear out the context.
    cleanForcurrentServerType();
    showNextStep();
  };

  // Basic Config

  const handleBasicConfig = async (e) => {
    e.preventDefault();
    // Generate server config

    // if the bilateral local repository was chosen and failed to be set then we disable that dom element.
    // if the basic config has been completed then the platform coudl have been changed - so allow the bilateral server to be chosen again
    document
      .getElementById("bitemporal-repository")
      .removeAttribute("disabled", "");
    setLoadingText("Generating server configuration...");
    document.getElementById("config-basic-config-element").style.display =
      "none";
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
      document.getElementById("config-basic-config-element").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Post server config
    setLoadingText(
      "Storing basic server configuration on OMAG server platform..."
    );
    // const setServerConfigURL = `/open-metadata/admin-services/users/${userId}/servers/${currentServerName}/configuration`;
    const currentServerName = serverConfig.localServerName;
    const serverConfigURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
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
    setCurrentServerConfig(serverConfig);
    let platformName;
    if (newPlatformName === undefined || newPlatformName === "") {
      platformName = Object.keys(activePlatforms)[0];
    } else {
      platformName = newPlatformName;
    }
    const platform = activePlatforms[platformName];
    setAvailableAccessServices(platform.accessServices);
    // if there are access services copnfigured for this server set them as current
    // then work out what the unconfigured ones should be
    if (
      serverConfig.accessServicesConfig == undefined ||
      serverConfig.accessServicesConfig.length === 0
    ) {
      setUnconfiguredAccessServices(platform.accessServices);
      setCurrentAccessServices([]);
    } else {
      const accessServicesFromServer = serverConfig.accessServicesConfig;
      setCurrentAccessServices(accessServicesFromServer);
      // work out the unconfigured access services
      let currentUrlMarkers = [];
      if (accessServicesFromServer && accessServicesFromServer.length > 0) {
        currentUrlMarkers = accessServicesFromServer.map(
          (service) => service.id
        );
      }
      let services = [];
      for (let i = 0; i < platform.accessServices.length; i++) {
        const availableAccessService = platform.accessServices[i];
        if (
          !currentUrlMarkers.includes(availableAccessService.serviceURLMarker)
        ) {
          services.push(availableAccessService);
          // clear out the option states
          // clearCurrentOptions();
        }
      }
      setUnconfiguredAccessServices(services);
    }
    setAvailableEngineServices(platform.engineServices);
    setAvailableViewServices(platform.viewServices);
    setAvailableIntegrationServices(platform.integrationServices);
    // Configure security connector
    if (currentServerSecurityConnector !== "") {
      setLoadingText("Configuring security connector...");
      const serverConfigURL = encodeURI(
        "/servers/" +
          tenantId +
          "/server-author/users/" +
          userId +
          "/servers/" +
          currentServerName +
          "/security/connection"
      );
      config = {
        class: "Connection",
        connectorType: {
          class: "ConnectorType",
          connectorProviderClassName: currentServerSecurityConnector,
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
      showNextStep();
    }
  };
  const onErrorConfigureServer = (error) => {
    console.error("Error sending config to platform", { error });
    setCurrentServerConfig(null);
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
    document.getElementById("config-basic-config-element").style.display =
      "block";
    document.getElementById("notification-container").style.display = "block";
  };

  const onSuccessfulEnableRepository = (json) => {
    const serverConfig = json.omagServerConfig;
    setCurrentServerConfig(serverConfig);
    showNextStep();
  };
  const onErrorEnableCruxServer = () => {
    alert(
      "The Bilateral repository is not available on the server please choose another local respository to enable."
    );
    document
      .getElementById("bitemporal-repository")
      .setAttribute("disabled", "disabled");
    document.getElementById("loading-container").style.display = "none";
    document.getElementById("local-repository-config-element").style.display =
      "block";
  };
  const onSuccessfulConfigureEventBusURL = (json) => {
    const serverConfig = json.omagServerConfig;
    setCurrentServerConfig(serverConfig);
    showNextStep();
  };

  const onSuccessfulConfigurationOfSecurityConnector = (json) => {
    const serverConfig = json.omagServerConfig;
    setCurrentServerConfig(serverConfig);
    showNextStep();
  };
  // local repository
  const handleLocalRepositoryConfig = () => {
    setLoadingText("Enabling local repository...");
    document.getElementById("local-repository-config-element").style.display =
      "none";
    document.getElementById("loading-container").style.display = "block";

    if (currentServerRepository) {
      setLoadingText("Enabling chosen local repository...");

      //local-repository/mode/plugin-repository/connection

      const serverConfigURL = encodeURI(
        "/servers/" +
          tenantId +
          "/server-author/users/" +
          userId +
          "/servers/" +
          currentServerName +
          "/local-repository/mode/" +
          currentServerRepository
      );

      if (serverConfigURL.endsWith("plugin-repository/connection")) {
        const body = {
          class: "Connection",
          connectorType: {
            class: "ConnectorType",
            connectorProviderClassName:
              "org.odpi.egeria.connectors.juxt.crux.repositoryconnector.CruxOMRSRepositoryConnectorProvider",
          },
        };
        issueRestCreate(
          serverConfigURL,
          body,
          onSuccessfulEnableRepository,
          onErrorEnableCruxServer,
          "omagServerConfig"
        );
      } else {
        issueRestCreate(
          serverConfigURL,
          undefined,
          onSuccessfulEnableRepository,
          onErrorConfigureServer,
          "omagServerConfig"
        );
      }
    }
    // Enable Access Services
    // try {
    // if (selectedAccessServices.length === availableAccessServices.length) {
    //   configureAccessServices();
    // } else {
    //   for (const service of selectedAccessServices) {
    //     setLoadingText(`Enabling ${service} access service...`);
    //     configureAccessServices(service);
    //   }
    // }
  };

  // Access Services (optional)
  // const handleAccessServicesConfig = () => {
  //   setLoadingText("Enabling access services...");
  //   document.getElementById("access-services-config-element").style.display =
  //     "none";
  //   document.getElementById("loading-container").style.display = "block";
  //   // Enable Access Services
  //   // try {
  //   if (selectedAccessServices !== undefined) {
  //     if (selectedAccessServices.length === availableAccessServices.length) {
  //       configureAccessServices();
  //     } else {
  //       for (const service of selectedAccessServices) {
  //         setLoadingText(`Enabling ${service} access service...`);
  //         configureAccessServices(service);
  //       }
  //     }
  //   }
  // };
  const configureAccessServices = (serviceURLMarker) => {
    console.log("called configureAccessServices", { serviceURLMarker });
    let configureAccessServicesURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
        "/access-services"
    );
    if (serviceURLMarker && serviceURLMarker !== "") {
      configureAccessServicesURL += "/" + serviceURLMarker;
    }

    issueRestCreate(
      configureAccessServicesURL,
      {}, // TODO supply appropriate access service options here - for example supported or default zones for asset orientated OMAS's
      onSuccessfulConfigureAccessServices,
      onErrorConfigureServer,
      "omagServerConfig"
    );
  };
  const onSuccessfulConfigureAccessServices = (json) => {
    const serverConfig = json.omagServerConfig;
    setCurrentServerConfig(serverConfig);
    configureAuditLogDestinations();
  };

  // Audit Log Destinations

  const configureAuditLogDestinations = () => {
    setLoadingText("Configuring audit log destinations...");
    document.getElementById("audit-log-config-element").style.display = "none";
    document.getElementById("loading-container").style.display = "block";

    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    // if (!currentServerAuditDestinations || currentServerAuditDestinations.length === 0) {
    //   throw new Error(`Cannot create OMAG server configuration without an audit log destination.`);
    // }

    showNextStep();
  };
  const onSuccessfulFetchServer = (json) => {
    const serverConfig = json.serverConfig;
    setCurrentServerConfig(serverConfig);
    showNextStep();
    document.getElementById("loading-container").style.display = "none";
  };

  const onErrorFetchServer = (error) => {
    console.error("Error fetching config", { error });
    setCurrentServerConfig(null);
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
    document.getElementById("config-basic-config-element").style.display =
      "block";
    document.getElementById("notification-container").style.display = "block";
  };

  const handleConfigureESB = () => {
    setLoadingText("Configuring Event Bus...");
    document.getElementById("esb-config-element").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Configure event bus
    setLoadingText("Configuring event bus...");
    const serverConfigURL = encodeURI(
      "/servers/" +
        tenantId +
        "/server-author/users/" +
        userId +
        "/servers/" +
        currentServerName +
        "/event-bus?topicURLRoot=egeriaTopics"
    );
    issueRestCreate(
      serverConfigURL,
      currentServerConfig,
      onSuccessfulConfigureEventBusURL,
      onErrorConfigureServer,
      "omagServerConfig"
    );
  };
  // Register to a cohort

  const handleRegisterCohorts = () => {
    setLoadingText("Registering cohort(s)...");
    document.getElementById("cohort-config-element").style.display = "none";
    document.getElementById("loading-container").style.display = "block";

    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    fetchServerConfig(onSuccessfulFetchServer, onErrorFetchServer);
  };

  // Configure open metadata archives to load on server startup

  const handleConfigureArchives = async () => {
    setLoadingText("Configuring archives(s) to load on server startup...");
    document.getElementById("archives-config-element").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Register archives
    for (const archiveName of currentServerOMArchives) {
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
        document.getElementById("cohort-config-element").style.display = "none";
        document.getElementById("archives-config-element").style.display =
          "block";
        document.getElementById("notification-container").style.display =
          "block";
        return;
      }
    }
    // Fetch Server Config
    // setLoadingText("Fetching final stored server configuration...");
    try {
      // const serverConfig = await fetchServerConfig();
      // setCurrentServerConfig(serverConfig);
      showNextStep();
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
      document.getElementById("cohort-config-element").style.display = "none";
      document.getElementById("archives-config-element").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  // Configure the Repository Proxy Connectors

  const handleConfigureRepositoryProxyConnectors = async () => {
    // If all three fields are blank, skip to next step
    if (
      (!currentServerProxyConnector || currentServerProxyConnector === "") &&
      (!currentServerEventMapperConnector ||
        currentServerEventMapperConnector === "") &&
      (!currentServerEventSource || currentServerEventSource === "")
    ) {
      showNextStep();
      return;
    }
    // If one or two fields are blank, show notification
    if (
      !currentServerProxyConnector ||
      currentServerProxyConnector === "" ||
      !currentServerEventMapperConnector ||
      currentServerEventMapperConnector === "" ||
      !currentServerEventSource ||
      currentServerEventSource === ""
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
    document.getElementById("repository-proxy-config-element").style.display =
      "none";
    document.getElementById("loading-container").style.display = "block";
    // Configure the repository proxy connector
    try {
      await configureRepositoryProxyConnector(currentServerProxyConnector);
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
      document.getElementById("repository-proxy-config-element").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Configure the repository event mapper connector
    setLoadingText("Configuring repository event mapper connector...");
    try {
      await configureRepositoryEventMapperConnector(
        currentServerEventMapperConnector,
        currentServerEventSource
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
      document.getElementById("repository-proxy-config-element").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    try {
      const serverConfig = await fetchServerConfig();
      setCurrentServerConfig(serverConfig);
      showNextStep();
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
      document.getElementById("repository-proxy-config-element").style.display =
        "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };
  const onChangeServerTypeSelected = (e) => {
    const serverType = e.currentTarget.value;
    setCurrentServerLocalServerType(serverType);
    const serverTypeElement = serverTypes.find((o) => o.id === serverType);
    setServerTypeDescription(serverTypeElement.description);
    setIsCurrentStepInvalid(false);

    // move to the next screen on click
  };

  // Configure the open metadata view services

  const handleConfigureViewServices = async () => {
    // If all three fields are blank, skip to next step
    if (
      (!currentServerViewServiceRemoteServerURLRoot ||
        currentServerViewServiceRemoteServerURLRoot === "") &&
      (!currentServerViewServiceRemoteServerName ||
        currentServerViewServiceRemoteServerName === "") &&
      (!selectedViewServices || !selectedViewServices.length)
    ) {
      showNextStep();
      return;
    }
    // If one or two fields are blank, show notification
    if (
      !currentServerViewServiceRemoteServerURLRoot ||
      currentServerViewServiceRemoteServerURLRoot === "" ||
      !currentServerViewServiceRemoteServerName ||
      currentServerViewServiceRemoteServerName === "" ||
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
    document.getElementById("view-services-element").style.display = "none";
    document.getElementById("loading-container").style.display = "block";
    // Enable View Services
    try {
      if (selectedViewServices.length === availableViewServices.length) {
        configureViewServices(
          currentServerViewServiceRemoteServerURLRoot,
          currentServerViewServiceRemoteServerName
        );
      } else {
        for (const service of selectedViewServices) {
          setLoadingText(`Enabling ${service} view service...`);
          configureViewServices(
            currentServerViewServiceRemoteServerURLRoot,
            currentServerViewServiceRemoteServerName,
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
      document.getElementById("view-services-element").style.display = "block";
      document.getElementById("notification-container").style.display = "block";
      return;
    }
    // Fetch Server Config
    setLoadingText("Fetching final stored server configuration...");
    try {
      const serverConfig = await fetchServerConfig();
      setCurrentServerConfig(serverConfig);
      showNextStep();
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
      document.getElementById("view-services-element").style.display = "block";
      document.getElementById("notification-container").style.display = "block";
    }
  };

  // // Configure the Discovery Engines

  // const handleConfigureDiscoveryEngines = async () => {
  //   // If all three fields are blank, skip to next step
  //   if (
  //     (!currentServerDiscoveryEngineRemoteServerURLRoot ||
  //       currentServerDiscoveryEngineRemoteServerURLRoot === "") &&
  //     (!currentServerDiscoveryEngineRemoteServerName ||
  //       currentServerDiscoveryEngineRemoteServerName === "") &&
  //     (!selectedDiscoveryEngines || !selectedDiscoveryEngines.length)
  //   ) {
  //     showNextStep();
  //     setProgressIndicatorIndex(progressIndicatorIndex + 1);
  //     return;
  //   }
  //   // If one or two fields are blank, show notification
  //   if (
  //     !currentServerDiscoveryEngineRemoteServerURLRoot ||
  //     currentServerDiscoveryEngineRemoteServerURLRoot === "" ||
  //     !currentServerDiscoveryEngineRemoteServerName ||
  //     currentServerDiscoveryEngineRemoteServerName === "" ||
  //     !selectedDiscoveryEngines ||
  //     !selectedDiscoveryEngines.length
  //   ) {
  //     setNotificationType("error");
  //     setNotificationTitle("Input Error");
  //     setNotificationSubtitle(
  //       `All three fields are required to configure the discovery engine. Leave all three fields blank to skip this step.`
  //     );
  //     document.getElementById("notification-container").style.display = "block";
  //     return;
  //   }
  //   setLoadingText("Configuring discovery engine client...");
  //   document.getElementById("discovery-engines-container").style.display =
  //     "none";
  //   document.getElementById("loading-container").style.display = "block";
  //   // Configure the discovery engines client
  //   try {
  //     await configureDiscoveryEngineClient(
  //       currentServerDiscoveryEngineRemoteServerURLRoot,
  //       currentServerDiscoveryEngineRemoteServerName
  //     );
  //   } catch (error) {
  //     setNotificationType("error");
  //     if (error.code && error.code === "ECONNABORTED") {
  //       setNotificationTitle("Connection Error");
  //       setNotificationSubtitle(
  //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
  //       );
  //     } else {
  //       setNotificationTitle("Configuration Error");
  //       setNotificationSubtitle(
  //         `Error configuring the discovery engine client. Please ensure the metadata server root URL and name are correct.`
  //       );
  //     }
  //     document.getElementById("loading-container").style.display = "none";
  //     document.getElementById("discovery-engines-container").style.display =
  //       "block";
  //     document.getElementById("notification-container").style.display = "block";
  //     return;
  //   }
  //   // Configure the discovery engines
  //   setLoadingText("Configuring discovery engines...");
  //   try {
  //     await configureDiscoveryEngines(selectedDiscoveryEngines);
  //   } catch (error) {
  //     setNotificationType("error");
  //     if (error.code && error.code === "ECONNABORTED") {
  //       setNotificationTitle("Connection Error");
  //       setNotificationSubtitle(
  //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
  //       );
  //     } else {
  //       setNotificationTitle("Configuration Error");
  //       setNotificationSubtitle(
  //         `Error configuring the discovery engines. ${error.message}`
  //       );
  //     }
  //     document.getElementById("loading-container").style.display = "none";
  //     document.getElementById("discovery-engines-container").style.display =
  //       "block";
  //     document.getElementById("notification-container").style.display = "block";
  //     return;
  //   }
  //   // Fetch Server Config
  //   setLoadingText("Fetching final stored server configuration...");
  //   try {
  //     const serverConfig = await fetchServerConfig();
  //     setCurrentServerConfig(serverConfig);
  //     showNextStep();
  //     setProgressIndicatorIndex(progressIndicatorIndex + 1);
  //   } catch (error) {
  //     console.error("error fetching server config", { error });
  //     setNotificationType("error");
  //     if (error.code && error.code === "ECONNABORTED") {
  //       setNotificationTitle("Connection Error");
  //       setNotificationSubtitle(
  //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
  //       );
  //     } else {
  //       setNotificationTitle("Configuration Error");
  //       setNotificationSubtitle(`Error fetching configuration for the server.`);
  //     }
  //     document.getElementById("loading-container").style.display = "none";
  //     document.getElementById("discovery-engines-container").style.display =
  //       "block";
  //     document.getElementById("notification-container").style.display = "block";
  //   }
  // };

  // // Configure the Stewardship Engines

  // const handleConfigureStewardshipEngines = async () => {
  //   console.log({
  //     currentServerStewardshipEngineRemoteServerURLRoot,
  //     currentServerStewardshipEngineRemoteServerName,
  //     selectedStewardshipEngines,
  //   });
  //   // If all three fields are blank, skip to next step
  //   if (
  //     (!currentServerStewardshipEngineRemoteServerURLRoot ||
  //       currentServerStewardshipEngineRemoteServerURLRoot === "") &&
  //     (!currentServerStewardshipEngineRemoteServerName ||
  //       currentServerStewardshipEngineRemoteServerName === "") &&
  //     (!selectedStewardshipEngines || !selectedStewardshipEngines.length)
  //   ) {
  //     showNextStep();
  //     setProgressIndicatorIndex(progressIndicatorIndex + 1);
  //     return;
  //   }
  //   // If one or two fields are blank, show notification
  //   if (
  //     !currentServerStewardshipEngineRemoteServerURLRoot ||
  //     currentServerStewardshipEngineRemoteServerURLRoot === "" ||
  //     !currentServerStewardshipEngineRemoteServerName ||
  //     currentServerStewardshipEngineRemoteServerName === "" ||
  //     !selectedStewardshipEngines ||
  //     !selectedStewardshipEngines.length
  //   ) {
  //     setNotificationType("error");
  //     setNotificationTitle("Input Error");
  //     setNotificationSubtitle(
  //       `All three fields are required to configure the stewardship engine. Leave all three fields blank to skip this step.`
  //     );
  //     document.getElementById("notification-container").style.display = "block";
  //     return;
  //   }
  //   setLoadingText("Configuring stewardship engine client...");
  //   document.getElementById("stewardship-engines-container").style.display =
  //     "none";
  //   document.getElementById("loading-container").style.display = "block";
  //   // Configure the stewardship engines client
  //   try {
  //     await configureStewardshipEngineClient(
  //       currentServerStewardshipEngineRemoteServerURLRoot,
  //       currentServerStewardshipEngineRemoteServerName
  //     );
  //   } catch (error) {
  //     setNotificationType("error");
  //     if (error.code && error.code === "ECONNABORTED") {
  //       setNotificationTitle("Connection Error");
  //       setNotificationSubtitle(
  //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
  //       );
  //     } else {
  //       setNotificationTitle("Configuration Error");
  //       setNotificationSubtitle(
  //         `Error configuring the stewardship engine client. Please ensure the metadata server root URL and name are correct.`
  //       );
  //     }
  //     document.getElementById("loading-container").style.display = "none";
  //     document.getElementById("stewardship-engines-container").style.display =
  //       "block";
  //     document.getElementById("notification-container").style.display = "block";
  //     return;
  //   }
  //   // Configure the stewardship engines
  //   setLoadingText("Configuring stewardship engines...");
  //   try {
  //     await configureStewardshipEngines(selectedStewardshipEngines);
  //   } catch (error) {
  //     setNotificationType("error");
  //     if (error.code && error.code === "ECONNABORTED") {
  //       setNotificationTitle("Connection Error");
  //       setNotificationSubtitle(
  //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
  //       );
  //     } else {
  //       setNotificationTitle("Configuration Error");
  //       setNotificationSubtitle(
  //         `Error configuring the stewardship engines. ${error.message}`
  //       );
  //     }
  //     document.getElementById("loading-container").style.display = "none";
  //     document.getElementById("stewardship-engines-container").style.display =
  //       "block";
  //     document.getElementById("notification-container").style.display = "block";
  //     return;
  //   }
  //   // Fetch Server Config
  //   setLoadingText("Fetching final stored server configuration...");
  //   try {
  //     const serverConfig = await fetchServerConfig();
  //     setCurrentServerConfig(serverConfig);
  //     showNextStep();
  //     setProgressIndicatorIndex(progressIndicatorIndex + 1);
  //   } catch (error) {
  //     console.error("error fetching server config", { error });
  //     setNotificationType("error");
  //     if (error.code && error.code === "ECONNABORTED") {
  //       setNotificationTitle("Connection Error");
  //       setNotificationSubtitle(
  //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
  //       );
  //     } else {
  //       setNotificationTitle("Configuration Error");
  //       setNotificationSubtitle(`Error fetching configuration for the server.`);
  //     }
  //     document.getElementById("loading-container").style.display = "none";
  //     document.getElementById("stewardship-engines-container").style.display =
  //       "block";
  //     document.getElementById("notification-container").style.display = "block";
  //   }
  // };

  // Config Preview

  // const handleDeployConfig = async (e) => {
  //   e.preventDefault();
  //   setLoadingText("Deploying OMAG server from stored configuration...");
  //   document.getElementById("config-preview-container").style.display = "none";
  //   document.getElementById("loading-container").style.display = "block";
  //   // Issue the instance call to start the new server
  //   const startServerURL = `/open-metadata/admin-services/users/${userId}/servers/${currentServerName}/instance`;
  //   try {
  //     const startServerResponse = await axios.post(
  //       startServerURL,
  //       {
  //         config: "",
  //         tenantId,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         timeout: 30000,
  //       }
  //     );
  //     if (startServerResponse.data.relatedHTTPCode === 200) {
  //       setNotificationType("success");
  //       setNotificationTitle("Success!");
  //       setNotificationSubtitle(`Server instance deployed from configuration.`);
  //       document.getElementById("loading-container").style.display = "none";
  //       document.getElementById("notification-container").style.display =
  //         "block";
  //       document.getElementById("server-list-container").style.display = "flex";
  //     } else {
  //       console.error(startServerResponse.data);
  //       throw new Error("Error in startServerResponse");
  //     }
  //   } catch (error) {
  //     console.error("Error starting server from stored config", { error });
  //     setNotificationType("error");
  //     if (error.code && error.code === "ECONNABORTED") {
  //       setNotificationTitle("Connection Error");
  //       setNotificationSubtitle(
  //         "Error connecting to the platform. Please ensure the OMAG server platform is available."
  //       );
  //     } else {
  //       setNotificationTitle("Deployment Error");
  //       setNotificationSubtitle(
  //         `Error starting server from stored configuration file.`
  //       );
  //     }
  //     document.getElementById("loading-container").style.display = "none";
  //     document.getElementById("config-preview-container").style.display =
  //       "block";
  //       document.getElementById("config-final-container").style.display =
  //       "block";
  //     document.getElementById("notification-container").style.display = "block";
  //   }
  // };

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

      <Row
        id="server-config-container"
        className="flex-column"
        style={{ display: "none" }}
      >
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

            <div className="server-type-container">
              <h4 className="left-text-bottom-margin-32">Select Server Type</h4>

              <Info16 onClick={() => displayHelpForServerTypes()} />
              {/* <input type="image"  alt="image of question mark"
                     onClick = { () => displayHelpForServerTypes() }  >
            </input> */}
            </div>
            <Select
              defaultValue="placeholder-item"
              helperText={serverTypeDescription}
              onChange={onChangeServerTypeSelected}
              id="select-server-type"
              invalidText="A valid value is required"
              labelText="Select"
            >
              <SelectItem
                text="Choose a Server type"
                value="placeholder-item"
                disabled
                hidden
              />
              <SelectItemGroup label="Cohort Member">
                <SelectItem
                  text="Metadata Access Store (previously referred to as a Metadata Server)"
                  value="metadata-server"
                />
                <SelectItem
                  text="Metadata Access Point"
                  value="metadata-access-point"
                />
                <SelectItem
                  text="Repository Proxy"
                  value="repository-proxy"
                  disabled
                />
                <SelectItem
                  text="Conformance Test Server"
                  value="conformance-test-server"
                  disabled
                />
              </SelectItemGroup>
              <SelectItemGroup label="Governance Servers">
                <SelectItem
                  text="Integration Daemon"
                  value="integration-daemon"
                  disabled
                />
                <SelectItem text="Engine Host" value="engine-host" disabled />
                <SelectItem
                  text="Data Engine Proxy"
                  value="data-engine-proxy"
                  disabled
                />
                <SelectItem
                  text="Open Lineage Server"
                  value="open-lineage-server"
                  disabled
                />
              </SelectItemGroup>
              <SelectItem text="View Server" value="view-server" disabled />
            </Select>
          </div>

          <div
            id="config-basic-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleBasicConfig}
            />
            <h4 className="left-text-bottom-margin-16">Basic Configuration</h4>
            <BasicConfig />
          </div>

          <div
            id="local-repository-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleLocalRepositoryConfig}
            />
            <h4 className="left-text-bottom-margin-24">
              Select Local Repository
            </h4>
            <ConfigureLocalRepository />
          </div>

          <div
            id="access-services-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={showNextStep}
            />
            <h4 className="left-text-bottom-margin-24">
              Configure Access Services
            </h4>
            <ConfigureAccessServices />
          </div>

          <div
            id="audit-log-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <h4 className="left-text-bottom-margin-24">
              Configure Audit Log Destinations
            </h4>
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={showNextStep}
            />

            <ConfigureAuditLogDestinations
              nextAction={() => configureAuditLogDestinations()}
              previousAction={handleBackToPreviousStep}
            />
          </div>

          <div
            id="esb-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleConfigureESB}
            />
            <h4 className="left-text-bottom-margin-24">Configure Event Bus</h4>
            <div className="left-text-bottom-margin-24">
              Configure Event Bus with default topicURLRoot as 'egeriaTopics'
            </div>
          </div>

          <div
            id="cohort-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleRegisterCohorts}
            />
            <h4 className="left-text-bottom-margin-24">
              Register to the following cohort(s):
            </h4>
            <RegisterCohorts />
          </div>

          <div
            id="archives-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleConfigureArchives}
            />
            <h4 className="left-text-bottom-margin-24">
              Configure the Open Metadata Archives that are loaded on server
              startup
            </h4>
            <ConfigureOMArchives />
          </div>

          <div
            id="repository-proxy-config-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleConfigureRepositoryProxyConnectors}
            />
            <h4 className="left-text-bottom-margin-24">
              Configure the Repository Proxy Connectors
            </h4>
            <ConfigureRepositoryProxyConnectors />
          </div>

          <div
            id="view-services-element"
            className="hideable"
            style={{ display: "none" }}
          >
            <NavigationButtons
              handlePreviousStep={handleBackToPreviousStep}
              handleNextStep={handleConfigureViewServices}
            />
            <h4 className="left-text-bottom-margin-24">
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
            <h4 className="left-text-bottom-margin-24">
              Configure the Open Metadata Integration Services (OMIS)
            </h4>
            <ConfigureIntegrationServices />
          </div>

          <div
            id="final-config-element"
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
              Congratulations you have successfully configured server '
              {currentServerName}'!
            </h4>
            <NavigationButtons handlePreviousStep={handleBackToPreviousStep} />
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
