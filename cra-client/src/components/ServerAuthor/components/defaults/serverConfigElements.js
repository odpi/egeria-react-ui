/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const serverConfigElements = [
  {
    id: "server-type-config-element",
    label: "Server Type",
    description: "Set the type of server to be configured."
  },
  {
    id: "config-basic-config-element",
    label: "Basic",
    description: "Basic configuration that all server types can have"
  },
  {
    id: "audit-log-config-element",
    label: "Audit log",
    description: "Configure the audit log destinations"
  },
  {
    id: "local-repository-config-element",
    label: "Repository",
    description: "Configure the local repository type."
  },
  {
    id: "access-services-config-element",
    label: "Access services",
    description: "Select the access services required for this server."
  },
  {
    id: "esb-config-element",
    label: "Event Bus",
    description: "Configure Event Bus."
  },
  {
    id: "cohort-config-element",
    label: "Cohorts",
    description: "Register which cohorts this server will be part of."
  },
  {
    id: "archives-config-element",
    label: "Archives",
    description: "Configure which open types archives are to be used by this server."
  },
  {
    id: "repository-proxy-config-element",
    label: "repository proxy",
    description: "Configure the repository proxy connectors to the target proprietory metadata repository."
  },
  {
    id: "view-services-config-element",
    label: "View Services",
    description: "Configure view services in order to be able to service a UI"
  },
  {
    id: "integration-daemon-config-element",
    label: "Integration Daemon",
    description: "Select and configure the Integration Services."
  },
  {
    id: "final-config-element",
    label: "Configured",
    description: "Server has been configured."
  },
  
];

export default serverConfigElements;