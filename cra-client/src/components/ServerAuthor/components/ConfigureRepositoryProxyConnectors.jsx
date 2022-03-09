/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";
import {
  // Button,
  TextInput,
} from "carbon-components-react";
// import {
//   Add16,
//   Subtract16,
// } from "@carbon/icons-react";

import { ServerAuthorContext } from "../contexts/ServerAuthorContext";

export default function ConfigureRepositoryProxyConnectors() {
  
  const {
    currentServerProxyConnector, setCurrentServerProxyConnector,
    currentServerEventMapperConnector, setCurrentServerEventMapperConnector,
    currentServerEventSource, setCurrentServerEventSource,
  } = useContext(ServerAuthorContext);

  return (

    <div style={{ textAlign: 'left' }}>

      <TextInput
        id="new-server-proxy-connector"
        name="new-server-proxy-connector"
        type="text"
        labelText="Open Metadata Repository Services (OMRS) Repository Connector"
        defaultValue={currentServerProxyConnector}
        onChange={e => setCurrentServerProxyConnector(e.target.value)}
        autoComplete="off"
      />

      <TextInput
        id="new-server-event-mapper-connector"
        name="new-server-event-mapper-connector"
        type="text"
        labelText="Open Metadata Repository Services (OMRS) Event Mapper Connector"
        defaultValue={currentServerEventMapperConnector}
        onChange={e => setCurrentServerEventMapperConnector(e.target.value)}
        style={{marginBottom: "16px"}}
        autoComplete="off"
      />

      <TextInput
        id="new-server-event-source"
        name="new-server-event-source"
        type="text"
        labelText="Event Source"
        defaultValue={currentServerEventSource}
        onChange={e => setCurrentServerEventSource(e.target.value)}
        style={{marginBottom: "16px"}}
        autoComplete="off"
      />

    </div>

  )

}