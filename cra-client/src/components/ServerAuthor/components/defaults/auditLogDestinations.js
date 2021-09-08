/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
const AUDIT_LOG_DESTINATION_PREFIX =
"org.odpi.openmetadata.adapters.repositoryservices.auditlogstore.";
const auditLogDestinations = [
  {
    id: "default",
    label: "Default",
    connectorProviderClassName: AUDIT_LOG_DESTINATION_PREFIX + "console.ConsoleAuditLogStoreProvider"
  },
  {
    id: "console",
    label: "Console",
    connectorProviderClassName: AUDIT_LOG_DESTINATION_PREFIX + "console.ConsoleAuditLogStoreProvider"
  },
  {
    id: "slf4j",
    label: "Simple Logging Facade for Java (SLF4J)",
    connectorProviderClassName: AUDIT_LOG_DESTINATION_PREFIX + "slf4j.SLF4JAuditLogStoreProvider" 
  },
  {
    id: "files",
    label: "JSON Files",
    connectorProviderClassName: AUDIT_LOG_DESTINATION_PREFIX + "file.FileBasedAuditLogStoreProvider"
  },
  {
    id: "event-topic",
    label: "Event Topic",
    connectorProviderClassName: AUDIT_LOG_DESTINATION_PREFIX + "eventtopic.EventTopicAuditLogStoreProvider"
  },
  {
    id: "connection",
    label: "Connection"
  }
];

export default auditLogDestinations;
