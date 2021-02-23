/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, {useState} from "react";
import "./Login.css";
import Egeriacolor from "../images/odpi/Egeria_logo_color";

import {
  Grid,
  Row,
  Column,
  Form,
  FormGroup,
  TextInput
} from "carbon-components-react";

const NoServerName = () => {
  const [serverName, setServerName] = useState("");

  const handleOnChange = (event) => {
    const value = event.target.value;
    setServerName(value);
    console.log("handleOnChange :" + value);
  };

  const validateForm = () => {
    return serverName && serverName.length > 0;
  };

  return (
    <div>
      <Egeriacolor />
      <div>Please supply a server name:</div>
      <Grid>
        <Row>
          <Column
            sm={{ span: 4 }}
            md={{ span: 4, offset: 2 }}
            lg={{ span: 4, offset: 6 }}
          >
            <Form id="egeria-login-form">
              <FormGroup legendText="">
                <TextInput
                  type="text"
                  labelText="Server Name"
                  id="server-name"
                  name="serverName"
                  value={serverName}
                  onChange={handleOnChange}
                  placeholder="Server Name"
                  required
                />
              </FormGroup>
              {validateForm() && (
                <a href={serverName}>Login with server name {serverName}</a>
              )}
            </Form>
          </Column>
        </Row>
      </Grid>
    </div>
  );
};

export default NoServerName;
