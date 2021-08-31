/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const serverConfigElements = [
  {
    id: "server-type-config-element",
    label: "Select server type",
    description: "Set the type of server to be configured."
  },
  {
    id: "config-basic-config-element",
    label: "Basic configuration",
    description: "Basic configuration that all server types can have"
  },
  {
    id: "audit-log-config-element",
    label: "Configure audit log destinations",
    description: "Configure the audit log destinations"
  },
  {
    id: "local-repository-config-element",
    label: "Configure Local Repository",
    description: "Configure the local repository type."
  },
  {
    id: "access-services-config-element",
    label: "Select access services",
    description: "Select the access services required for this server."
  },
  {
    id: "esb-config-element",
    label: "Configure Event Bus",
    description: "Configure Event Bus."
  },
  {
    id: "cohort-config-element",
    label: "Register to a cohort",
    description: "Register which cohorts this server will be part of."
  },
  {
    id: "archives-config-element",
    label: "Configure the open metadata archives",
    description: "Configure which open types archives are to be used by this server."
  },
  {
    id: "repository-proxy-config-element",
    label: "Configure the repository proxy connectors",
    description: "Configure the repository proxy connectors to the target proprietory metadata repository."
  },
  {
    id: "view-services-config-element",
    label: "Select and configure the View Services",
    description: "Configure view services in order to be able to service a UI"
  },
  {
    id: "integration-daemon-config-element",
    label: "Integration Daemon",
    description: "Select and configure the Integration Services."
  },
  {
    id: "final-config-element",
    label: "Server configured",
    description: "Server has been confiured."
  },
  
]

export default serverConfigElements;