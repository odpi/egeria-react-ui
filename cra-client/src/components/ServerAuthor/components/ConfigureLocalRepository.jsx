/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";
import { TileGroup, RadioTile } from "carbon-components-react";

import { ServerAuthorContext } from "../contexts/ServerAuthorContext";

export default function ConfigureLocalRepository() {
  const { newServerRepository, setNewServerRepository } =
    useContext(ServerAuthorContext);

  return (
    <div className="left-text">
      <fieldset className="bx--fieldset" style={{ marginBottom: "32px" }}>
        <legend className="bx--label left-text">
          Server repository type
        </legend>
        <TileGroup
          defaultSelected="in-memory-repository"
          name="repository-types"
          valueSelected={newServerRepository}
          legend=""
          onChange={(value) => setNewServerRepository(value)}
          style={{ marginTop: "16px", textAlign: "left" }}
        >
          <RadioTile
            id="bitemporal-repository"
            light={false}
            name="bitemporal-repository"
            tabIndex={2}
            value="plugin-repository/connection"
          >
            Bitemporal repository (in memory Crux)
          </RadioTile>
          <RadioTile
            id="local-graph-repository"
            light={false}
            name="local-graph-repository"
            tabIndex={1}
            value="local-graph-repository"
          >
            Non-temporal local Graph (Janus)
          </RadioTile>
          <RadioTile
            id="in-memory-repository"
            light={false}
            name="in-memory-repository"
            tabIndex={0}
            value="in-memory-repository"
          >
            In Memory
          </RadioTile>

          <RadioTile
            id="read-only-repository"
            light={false}
            name="read-only-repository"
            tabIndex={2}
            value="read-only-repository"
          >
            Read Only
          </RadioTile>
        </TileGroup>
      </fieldset>
    </div>
  );
}
