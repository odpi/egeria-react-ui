/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";
import { TextInput, Select, SelectItem } from "carbon-components-react";

import { ServerAuthorContext } from "../contexts/ServerAuthorContext";

export default function BasicConfig() {
  const {
    newServerName,
    setNewServerName,
    newPlatformName,
    setNewPlatformName,
    newServerOrganizationName,
    setNewServerOrganizationName,
    newServerDescription,
    setNewServerDescription,
    newServerLocalUserId,
    setNewServerLocalUserId,
    newServerLocalPassword,
    setNewServerLocalPassword,
    newServerMaxPageSize,
    setNewServerMaxPageSize,
    newServerSecurityConnector,
    setNewServerSecurityConnector,
    basicConfigFormStartRef,
    activePlatforms,
  } = useContext(ServerAuthorContext);

  const onChangePlatformSelected = (e) => {
    setNewPlatformName(e.target.value);
  };

  return (
    <div className="left-text">
      <fieldset className="bx--fieldset" style={{ marginBottom: "32px" }}>
        <TextInput
          id="new-server-name"
          name="new-server-name"
          type="text"
          labelText="Server name"
          value={newServerName}
          onChange={(e) => setNewServerName(e.target.value)}
          placeholder="cocoMDS1"
          invalid={newServerName === ""}
          style={{ marginBottom: "16px", width: "100%" }}
          ref={basicConfigFormStartRef}
          autoComplete="off"
        />
        <TextInput
          id="new-server-local-user-id"
          name="new-server-local-user-id"
          type="text"
          labelText="Local user ID"
          value={newServerLocalUserId}
          onChange={(e) => setNewServerLocalUserId(e.target.value)}
          placeholder="my_server_user_id"
          invalid={newServerLocalUserId === ""}
          style={{ marginBottom: "16px" }}
          autoComplete="off"
        />

        <TextInput.PasswordInput
          id="new-server-local-password"
          name="new-server-local-password"
          labelText="Local password"
          value={newServerLocalPassword}
          onChange={(e) => setNewServerLocalPassword(e.target.value)}
          placeholder="my_server_Password"
          style={{ marginBottom: "16px" }}
          autoComplete="new-password"
        />
        {activePlatforms !== undefined &&
          Object.keys(activePlatforms)[0] !== undefined && (
            <Select
              defaultValue={Object.keys(activePlatforms)[0]}
              // helperText={serverTypeDescription}
              onChange={onChangePlatformSelected}
              id="select-platform"
              invalidText="A valid value is required"
            >
              {/* <SelectItem
            text="Choose a platform"
            value="placeholder-item"
            disabled
            hidden
          /> */}
              {Object.keys(activePlatforms).map((platformName) => (
                <SelectItem
                  text={platformName}
                  value={platformName}
                  id={platformName}
                  key={platformName}
                />
              ))}
            </Select>
          )}
        <TextInput
          id="new-server-organization-name"
          name="new-server-organization-name"
          type="text"
          labelText="Organization name"
          value={newServerOrganizationName}
          onChange={(e) => setNewServerOrganizationName(e.target.value)}
          placeholder="Org 1"
          invalid={newServerOrganizationName === ""}
          style={{ marginBottom: "16px" }}
          autoComplete="off"
        />

        <TextInput
          id="new-server-description"
          name="new-server-description"
          type="text"
          labelText="Server Description"
          value={newServerDescription}
          onChange={(e) => setNewServerDescription(e.target.value)}
          placeholder=""
          style={{ marginBottom: "16px" }}
          autoComplete="off"
        />

        <TextInput
          id="new-server-max-page-size"
          name="new-server-max-page-size"
          type="text"
          labelText="Max page size"
          value={newServerMaxPageSize}
          onChange={(e) => setNewServerMaxPageSize(e.target.value)}
          placeholder="1000"
          invalid={newServerMaxPageSize === ""}
          style={{ marginBottom: "16px" }}
        />

        <TextInput
          id="new-server-security-connector"
          name="new-server-security-connector"
          type="text"
          labelText="Security Connector (Class Name)"
          value={newServerSecurityConnector}
          onChange={(e) => setNewServerSecurityConnector(e.target.value)}
          placeholder="Fully Qualified Java Class Name"
          helperText="Note: This field is optional. Leave blank to skip."
          style={{ marginBottom: "16px" }}
        />
      </fieldset>
    </div>
  );
}
