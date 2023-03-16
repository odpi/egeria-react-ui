/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext } from "react";
import {
  Button
} from "carbon-components-react";
import { ServerAuthorContext } from "../contexts/ServerAuthorContext";
import serverConfigElements from "./defaults/serverConfigElements";

export default function NavigationButtons({ handlePreviousStep, handleNextStep }) {

  const {
    currentServerLocalServerType,
    progressIndicatorIndex,
    serverConfigurationSteps,
    hideConfigForm,
    cleanForNewServerType,
    isCurrentStepInvalid
  } = useContext(ServerAuthorContext);

  const steps = serverConfigurationSteps(currentServerLocalServerType);

  const getStepLabel = (index) => {
    const id = steps[index];
    const serverTypeElement = serverConfigElements.find(o => o.id === id); 
    return serverTypeElement.label;
  };
  const onCancelConfiguration = () => {
    hideConfigForm();
    cleanForNewServerType();


  };

  // First step

  if (progressIndicatorIndex === 0) {

    return (
      <div className="bx--btn-set">
        <Button
          kind="tertiary"
          style={{margin: "16px auto"}}
          onClick={(e) => onCancelConfiguration()}
          // onClick={hideConfigForm}
        >
          Cancel Configuration
        </Button>
        <Button
          type="submit"
          kind="tertiary"
          style={{margin: "16px auto"}}
          onClick={handleNextStep}
          disabled={isCurrentStepInvalid} 
        >
          Proceed to {getStepLabel(progressIndicatorIndex + 1)}
        </Button>
      </div>
    )

  }

  // Last step

  if (progressIndicatorIndex === steps.length - 1) {

    return (

      <div className="bx--btn-set">
        <Button
           kind="tertiary"
          style={{margin: "16px auto"}}
          onClick={hideConfigForm}
        >
          Finished
        </Button>
      </div>
  
    )

  }

  // In between step
  
  return (

    <div className="bx--btn-set">
      <Button
         kind="tertiary"
        style={{margin: "16px auto"}}
        onClick={hideConfigForm}
      >
        Cancel Configuration
      </Button>
      <Button
        kind="tertiary"
        style={{margin: "16px auto"}}
        onClick={handlePreviousStep}
      >
        Back to {getStepLabel(progressIndicatorIndex - 1)}
      </Button>
      <Button
        type="submit"
        kind="tertiary"
        style={{margin: "16px auto"}}
        onClick={handleNextStep}
        disabled={isCurrentStepInvalid} 
      >
        Proceed to {getStepLabel(progressIndicatorIndex + 1)}
      </Button>
    </div>

  )

}