/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";
import {
  ProgressIndicator,
  ProgressStep,
} from "carbon-components-react";
import { ServerAuthorContext } from "../contexts/ServerAuthorContext";
import serverConfigElements from "./defaults/serverConfigElements";

export default function ConfigurationSteps() {

  const {
    newServerLocalServerType,
    progressIndicatorIndex,
    serverConfigurationSteps
  } = useContext(ServerAuthorContext);

  const steps = serverConfigurationSteps(newServerLocalServerType);

  const getStepLabel = (index) => {
    const id = steps[index];
    const serverTypeElement = serverConfigElements.find(o => o.id === id); 
    return serverTypeElement.label;
  };

  return (

    <ProgressIndicator
      id="config-progress-indicator"
      vertical={false}
      currentIndex={progressIndicatorIndex}
      spaceEqually={false}
      style={{marginTop: "98px"}}
    >
      {steps.map((step, i) => (
        <ProgressStep
          key={`server-configuration-step-${i}`}
          label={getStepLabel(i)}
          description={`Step ${i + 1}: OMAG server wizard`}
        />
      ))}
    </ProgressIndicator>

  )

}