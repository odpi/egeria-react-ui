/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useEffect, useRef, useState } from "react";

/*
 * Import the DEFAULT export from the InteractionContext module - which is actually the InteractionContextProvider
 * Naming it explicitly for clarity that this is the provider not the context.
 */
import InteractionContextProvider from "./contexts/InteractionContext";

/*
 * Import the DEFAULT export from the InstancesContext module - which is actually the InstancesContextProvider
 * Naming it explicitly for clarity that this is the provider not the context.
 */
import InstancesContextProvider from "./contexts/InstancesContext";

import InstanceRetrieval from "./components/instance-retrieval/InstanceRetrieval";
import DetailsPanel from "./components/details-panel/DetailsPanel";
import DiagramManager from "./components/diagram/DiagramManager";
import GraphControls from "./components/graph-controls/GraphControls";
import HelpHandler from "./HelpHandler";
import HelpMarkdown from "./HELP.md";

import "./glove.scss";
import CreateRelationshipButtonWidget from "./components/graph-controls/CreateRelationshipButtonWidget";
import CreateNodeButtonWidget from "./components/graph-controls/CreateNodeButtonWidget";
import UpdateButtonWidget from "./components/graph-controls/UpdateButtonWidget";
import DeleteButtonWidget from "./components/graph-controls/DeleteButtonWidget";

export default function GlossaryAuthorVisualisation(props) {
  const containerDiv = useRef();

  /*
   * Height and width are stateful, so will cause a re-render.
   */
  const [dimensions, setDimensions] = useState({
    cltWidth: document.documentElement.clientWidth,
    cltHeight: document.documentElement.clientHeight,
  });

  const [help, setHelp] = useState({ markdown: "" });
  const [helpStatus, setHelpStatus] = useState("idle");

  let workingHeight = dimensions.cltHeight - 50;
  let workingWidth = dimensions.cltWidth - 265;

  /*
   * Do not set the containerDiv dimensions until AFTER the cpt has first rendered, as this creates the containerDiv
   */
  if (containerDiv.current) {
    containerDiv.current.style.width = "" + workingWidth + "px";
    containerDiv.current.style.height = "" + workingHeight + "px";
  }

  /*
   * Window resize event handler
   */
  const updateSize = () => {
    /*
     * Determine client height, width and set container and diagram dimensions then set dimensions.
     * The setDimensions is to ensure that we trigger a re-render.
     */
    let newClientWidth = document.documentElement.clientWidth;
    let newClientHeight = document.documentElement.clientHeight;

    let workingWidth = newClientWidth - 265;
    let workingHeight = newClientHeight - 50;

    containerDiv.current.style.width = "" + workingWidth + "px";
    containerDiv.current.style.height = "" + workingHeight + "px";

    let newDimensions = {
      cltWidth: newClientWidth,
      cltHeight: newClientHeight,
    };

    setDimensions(newDimensions);
  };

  const displayHelp = () => {
    setHelpStatus("complete");
  };

  const cancelHelpModal = () => {
    setHelpStatus("idle");
  };

  const submitHelpModal = () => {
    setHelpStatus("idle");
  };

  /*
   * useEffect to set size of container...
   */
  useEffect(
    () => {
      /* Attach event listener for resize events */
      window.addEventListener("resize", updateSize);

      /* On unmount, remove the event listener. */
      return () => window.removeEventListener("resize", updateSize);
    },
    [] /* run effect once only */
  );

  /*
   * useEffect to load markdown readme file
   */
  useEffect(
    () => {
      // Get the content of the markdown file and save it in 'readme'.
      fetch(HelpMarkdown)
        .then((res) => res.text())
        .then((text) => setHelp({ markdown: text }));
    },
    [] /* run effect once only */
  );
  return (
    <div className="glove-container" ref={containerDiv}>
      <InteractionContextProvider>
        <InstancesContextProvider>
          <div className="glove-top">
            <div className="title">
              <p>Glossary author visualisation explorer (glove) </p>

              <HelpHandler
                status={helpStatus}
                help={help}
                onCancel={cancelHelpModal}
                onSubmit={submitHelpModal}
              />
            </div>
            {/* Get the node we have been given       */}
            <div className="glove-top-middle">
              <InstanceRetrieval nodeType={props.nodeType} guid={props.guid} />
            </div>
            <div className="top-authoring-controls">
              <div className="authoring-button-container">
                <div className="right-margin">
                  <div>Explore</div>
                  <GraphControls />
                </div>
                <div>
                  <div>Author</div>
                  <div className="bottom-margin">
                    <CreateRelationshipButtonWidget />
                    <CreateNodeButtonWidget />
                    <UpdateButtonWidget />
                    <DeleteButtonWidget />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glove-content">
            <div className="glove-lhs">
              <DetailsPanel />
            </div>

            <div className="glove-rhs">
              <DiagramManager
                height={workingHeight - 300}
                width={workingWidth - 500}
              />
            </div>
          </div>
        </InstancesContextProvider>
      </InteractionContextProvider>
    </div>
  );
}
