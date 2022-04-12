/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";
import { TextInput, Select, SelectItem } from "carbon-components-react";

import { ServerAuthorContext } from "../contexts/ServerAuthorContext";

export default function BasicConfig() {
  const {
    currentServerName,
    setCurrentServerName,
    setCurrentPlatformName,
    currentServerOrganizationName,
    setCurrentServerOrganizationName,
    currentServerDescription,
    setCurrentServerDescription,
    currentServerLocalUserId,
    setCurrentServerLocalUserId,
    currentServerLocalPassword,
    setCurrentServerLocalPassword,
    currentServerMaxPageSize,
    setCurrentServerMaxPageSize,
    currentServerSecurityConnector,
    setCurrentServerSecurityConnector,
    basicConfigFormStartRef,
    activePlatforms,
  } = useContext(ServerAuthorContext);

  const onChangePlatformSelected = (e) => {
    setCurrentPlatformName(e.target.value);
  };

  return (
    <div className="left-text">
      <fieldset className="bx--fieldset" style={{ marginBottom: "32px" }}>
        <TextInput
          id="current-server-name"
          name="current-server-name"
          type="text"
          labelText="Server name"
          value={currentServerName}
          onChange={(e) => setCurrentServerName(e.target.value)}
          placeholder="cocoMDS1"
          invalid={currentServerName === ""}
          style={{ marginBottom: "16px", width: "100%" }}
          ref={basicConfigFormStartRef}
          autoComplete="off"
        />
        <TextInput
          id="current-server-local-user-id"
          name="current-server-local-user-id"
          type="text"
          labelText="Local user ID"
          value={currentServerLocalUserId}
          onChange={(e) => setCurrentServerLocalUserId(e.target.value)}
          placeholder="my_server_user_id"
          invalid={currentServerLocalUserId === ""}
          style={{ marginBottom: "16px" }}
          autoComplete="off"
        />

        <TextInput.PasswordInput
          id="current-server-local-password"
          name="current-server-local-password"
          labelText="Local password"
          value={currentServerLocalPassword}
          onChange={(e) => setCurrentServerLocalPassword(e.target.value)}
          placeholder="my_server_Password"
          style={{ marginBottom: "16px" }}
          autoComplete="current-password"
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
          id="current-server-organization-name"
          name="current-server-organization-name"
          type="text"
          labelText="Organization name"
          value={currentServerOrganizationName}
          onChange={(e) => setCurrentServerOrganizationName(e.target.value)}
          placeholder="Org 1"
          invalid={currentServerOrganizationName === ""}
          style={{ marginBottom: "16px" }}
          autoComplete="off"
        />

        <TextInput
          id="current-server-description"
          name="current-server-description"
          type="text"
          labelText="Server Description"
          value={currentServerDescription}
          onChange={(e) => setCurrentServerDescription(e.target.value)}
          placeholder=""
          style={{ marginBottom: "16px" }}
          autoComplete="off"
        />

        <TextInput
          id="current-server-max-page-size"
          name="current-server-max-page-size"
          type="text"
          labelText="Max page size"
          value={currentServerMaxPageSize}
          onChange={(e) => setCurrentServerMaxPageSize(e.target.value)}
          placeholder="1000"
          invalid={currentServerMaxPageSize === ""}
          style={{ marginBottom: "16px" }}
        />

        <TextInput
          id="current-server-security-connector"
          name="current-server-security-connector"
          type="text"
          labelText="Security Connector (Class Name)"
          value={currentServerSecurityConnector}
          onChange={(e) => setCurrentServerSecurityConnector(e.target.value)}
          placeholder="Fully Qualified Java Class Name"
          helperText="Note: This field is optional. Leave blank to skip."
          style={{ marginBottom: "16px" }}
        />
      </fieldset>
    </div>
  );
}
