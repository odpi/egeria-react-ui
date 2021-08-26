/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const serverTypes = [
  {
    id: "omag-server",
    label: "OMAG Server",
    abstract: true,
    description: "A software server that runs inside the OMAG server platform. It supports the integration of one or more technologies by hosting connectors that interact with that technology, or providing specialist APIs or event topics (both in and out)."
  },
  {
    id: "cohort-member",
    label: "Cohort Member",
    abstract: true,
    description: "Able to exchange metadata through an open metadata repository cohort"
  },
  {
    id: "governance-server",
    label: "Governance Server",
    abstract: true,
    description: "supports the use of metadata in the broader IT landscape"
  },
  {
    id: "view-server",
    label: "View Server",
    description: "Manages specialist services for user interfaces."
  },
  {
    id: "metadata-server",
    label: "Metadata Server",
    description: "supports a metadata repository that can natively store open metadata types as well as specialized metadata APIs for different types of tools (these APIs are called access services)."
  },
  {
    id: "metadata-access-point",
    label: "Metadata Access Point",
    description: "supports the access services like the metadata server but does not have a repository. All of the metadata it serves up and stores belongs to the metadata repositories in other members of the cohort."
  },
  {
    id: "repository-proxy",
    label: "Repository Proxy",
    description: "acts as an open metadata translator for a proprietary metadata repository. It supports open metadata API calls and translates them to the proprietary APIs of the repository. It also translates events from the proprietary repository into open metadata events that flow over the cohort."
  },
  {
    id: "conformance-test-server",
    label: "Conformance Test Server",
    description: "Validates that a member of the cohort is conforming with the open metadata protocols. This server is typically only see in development and test cohort rather than production."
  },
  {
    id: "data-engine-proxy",
    label: "Data Engine Proxy",
    description: "Supports the capture of metadata from a data engine. This includes details of the processing of data that it is doing which is valuable when piecing together lineage"
  },
  {
    id: "integration-daemon",
    label: "Integration Daemon",
    description: "Manages the synchronization with third party technology that can not call the access services directly."
  },
  {
    id: "engine-host",
    label: "Engine Host",
    description: "Provides a runtime for a specific type of governance engine."
  },
  {
    id: "open-lineage-server",
    label: "Open Lineage Server",
    description: "Manages the collation of lineage information am maintains it in a format for reporting. This includes the state of the lineage at different points in time."
  },
  
]

export default serverTypes;