/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
} from "carbon-components-react";
import StartingNodeNavigation from "./StartingNodeNavigation";
import NodeReadOnly from "../authoringforms/NodeReadOnly";
import { useHistory } from "react-router-dom";


/**
 * This is a search node wizard. The first page of the wizard is the search screen. Thisfollowed by a confirmation screen,
 *  where the user can confirm the node that has been found is the one they want.
 *
 * This component drives the StartingNodeNavigation component to allow the user to pick the node.
 * This component then drives NodeReadOnly which displays the confirmation screen.
 *
 * @param {*} props
 * @returns
 */
export default function SearchNodeWizard(props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [nodeChosen, setNodeChosen] = useState();

  let history = useHistory();
  console.log("SearchNodeWizard");

  const HandleGotChosen = (e) => {
    e.preventDefault();
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  };

  const nextStep = () => {
    const newIndex = currentStepIndex + 1;
    setCurrentStepIndex(newIndex);
  };
  const previousStep = () => {
    const newIndex = currentStepIndex - 1;
    setCurrentStepIndex(newIndex);
  };
  const finished = () => {
    if (props.onModalContentRequestedClose) {
      // if in a modal then callback to close the modal
      props.onModalContentRequestedClose();
      let payLoad = {};
      payLoad.node = nodeChosen;
      props.onChosen(payLoad);
    } else {
      // in not in a modal got back to the last page 
      history.goBack();
    }
  };
  const onChosen = (node) => {
    setNodeChosen(node);
  };
  const validateUserChosen = () => {
    let valid = false;
    if (nodeChosen !== undefined) {
      valid = true;
    }
    return valid;
  }

  const getTitle = () => {
    return "Choose " + props.nodeType.typeName + " Wizard";
  };
  const getStep1Title = () => {
    return "Choose " + props.nodeType.typeName ;
  };
  const getStep1Label = () => {
    return "Choose";
  };
  const getStep1Description = () => {
    return "Step 1: Choose " + props.nodeType.typeName ;
  };

  const getStep2Title = () => {
    let title = "Chosen a "  + props.nodeType.typeName ;
    return title;
  };
  const getStep2Label = () => {
    return "Confirm";
  };
  const getStep2Description = () => {
    return "Step 2: confirm the " + props.nodeType.typeName  + " is the one you want to add to the canvas";
  };

  return (
    <div>
      <h1>{getTitle()}</h1>
      <ProgressIndicator currentIndex={currentStepIndex}>
        <ProgressStep
          label={getStep1Label()}
          description={getStep1Description()}
        />
        <ProgressStep
          label={getStep2Label()}
          description={getStep2Description()}
        />
      </ProgressIndicator>
      <div className="wizard-navigation-container">
        {currentStepIndex === 0 && (
          <div>
            <Button
              kind="secondary"
              onClick={HandleGotChosen}
              disabled={!validateUserChosen()}
            >
              Next
            </Button>
          </div>
        )}

        {currentStepIndex === 1 && nodeChosen === undefined && (
          <div>
            <Button kind="secondary" onClick={previousStep}>
              Previous
            </Button>
          </div>
        )}
        {currentStepIndex === 1 && nodeChosen !== undefined && (
          <div>
            <Button kind="secondary" onClick={finished}>
              Finished
            </Button>
          </div>
        )}
      </div>
      <div className="wizard-navigation-container">
        {currentStepIndex === 0 && (
          <div>
            <h3 className="wizard-page-title">{getStep1Title()}</h3>
            <StartingNodeNavigation
              match={props.match}
              nodeTypeName="category"
              onSelectCallback={onChosen}
            />
          </div>
        )}

        {currentStepIndex === 1 && (
          <div>
            <h3 className="wizard-page-title">{getStep2Title()}</h3>
            <NodeReadOnly
              currentNodeType={props.currentNodeType}
              inputNode={nodeChosen}
            />
          </div>
        )}
      </div>
    </div>
  );
}
