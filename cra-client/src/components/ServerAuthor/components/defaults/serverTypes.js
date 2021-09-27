/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const serverTypes = [

  {
    id: "metadata-server",
    label: "Metadata Access Store (previously called Metadata Server)",
    description: "Supports the access services and supports a metadata repository that can natively store open metadata types as well as specialized metadata APIs for different types of tools (these APIs are called access services).",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "local-repository-config-element", "esb-config-element", "cohort-config-element", "access-services-config-element", "archives-config-element", "audit-log-config-element", "final-config-element"]
  },
  {
    id: "metadata-access-point",
    label: "Metadata Access Point",
    description: "Supports the access services like the access store server, but does not have a repository. All of the metadata it serves up and stores belongs to the metadata repositories in other members of the cohort.",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "esb-config-element", "cohort-config-element", "access-services-config-element", "archives-config-element", "audit-log-config-element", "final-config-element"] 
  },
  {
    id: "repository-proxy",
    label: "Repository Proxy",
    description: "Acts as an open metadata translator for a proprietary metadata repository. It supports open metadata API calls and translates them to the proprietary APIs of the repository. It also translates events from the proprietary repository into open metadata events that flow over the cohort.",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "esb-config-element", "cohort-config-element", "archives-config-element", "audit-log-config-element", "final-config-element"]
  },
  {
    id: "view-server",
    label: "View Server",
    description: "Manages specialist services for user interfaces.",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "view-services-config-element", "audit-log-config-element", "final-config-element"]
  },
  {
    id: "conformance-test-server",
    label: "Conformance Test Server",
    description: "Validates that a member of the cohort is conforming with the open metadata protocols. This server is typically only see in development and test cohort rather than production.",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "esb-config-element", "cohort-config-element",, "audit-log-config-element", "final-config-element"]
  },
  {
    id: "data-engine-proxy",
    label: "Data Engine Proxy",
    description: "Supports the capture of metadata from a data engine. This includes details of the processing of data that it is doing which is valuable when piecing together lineage",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element",  "audit-log-config-element"]
  },
  {
    id: "integration-daemon",
    label: "Integration Daemon",
    description: "Manages the synchronization with third party technology that can not call the access services directly.",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "integration-daemon-config-element", "audit-log-config-element", "final-config-element"]
  },
  {
    id: "engine-host",
    label: "Engine Host",
    description: "Provides a runtime for a specific type of governance engine.",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "audit-log-config-element", "final-config-element"]
  },
  {
    id: "open-lineage-server",
    label: "Open Lineage Server",
    description: "Manages the collation of lineage information am maintains it in a format for reporting. This includes the state of the lineage at different points in time.",
    serverConfigElements : ["server-type-config-element", "config-basic-config-element", "audit-log-config-element", "final-config-element"]
  },
  
];

export default serverTypes;