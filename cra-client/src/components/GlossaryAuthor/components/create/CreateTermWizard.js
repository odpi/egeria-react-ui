/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState } from "react";
import {
  ProgressIndicator,
  ProgressStep,
  Button,
} from "carbon-components-react";
import StartingNodeNavigation from "../navigations/StartingNodeNavigation";
import CreateNodePage from "./CreateNodePage";
import CreateGovernanceClassification from "./CreateGovernanceClassification";

/**
 * This is a node creation wizard - that is used to creae categories and terms. The first page of the wizard
 * asks the user to input values for the Category or Term to create. The next page then asks the user for the glossary that the
 * Category or Term will be stored in, finally there is a confirmation screen, where the user can confirm the values
 * that will be used to create the Node.
 *
 *
 * This component drives the CreateNodePage component, which displays the node. There are callbacks to the wizard
 * when the user has finsished with entering creation content and chosen a glossary.
 *
 * @param {*} props
 * @returns
 */
export default function CreateTermWizard(props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [glossaryGuid, setGlossaryGuid] = useState();
  const [nodeCreated, setNodeCreated] = useState();
  const [nodeToCreate, setNodeToCreate] = useState();
  // const [confidenceToCreate, setConfidenceToCreate] = useState();
  // const [retentionToCreate, setRetentionToCreate] = useState();
  // const [confidentialityToCreate, setConfidentialityToCreate] = useState();
  // const [criticalityToCreate, setCriticalityToCreate] = useState();
  console.log("CreateNodeWizard");

  const handleGotCreateDetailsOnClick = (e) => {
    e.preventDefault();
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  };
  const onRestart = () => {
    setCurrentStepIndex(0);
  };
  const addConfidentiality = (e) => {
    e.preventDefault();
    if (currentStepIndex === 1) {
      setCurrentStepIndex(2);
    }
  };
  const addConfidence = (e) => {
    e.preventDefault();
    if (currentStepIndex === 2) {
      setCurrentStepIndex(3);
    }
  };
  const addCriticality = (e) => {
    e.preventDefault();
    if (currentStepIndex === 3) {
      setCurrentStepIndex(4);
    }
  };
  const addRetention = (e) => {
    e.preventDefault();
    if (currentStepIndex === 4) {
      setCurrentStepIndex(5);
    }
  };
  const confirmCreateDetails = (e) => {
    e.preventDefault();
    if (currentStepIndex === 5) {
      setCurrentStepIndex(6);
    }
  };

  const isValidForConfirm = () => {
    let isValid = false;
    if (
      glossaryGuid !== undefined &&
      nodeToCreate !== undefined &&
      nodeToCreate.name !== undefined &&
      nodeToCreate.name !== ""
    ) {
      isValid = true;
    }
    return isValid;
  };
  const validateCreateDetails = () => {
    let isValid = false;
    if (
      nodeToCreate !== undefined &&
      nodeToCreate.name !== undefined &&
      nodeToCreate.name !== ""
    ) {
      isValid = true;
    }
    return isValid;
  };

  const onGlossarySelect = (guid) => {
    setGlossaryGuid(guid);
  };
  const onCreate = () => {
    setNodeCreated(true);
  };
  const onGotCreateDetails = (node) => {
    console.log("onGotCreateDetails " + JSON.stringify(node));
    if (node.name !== undefined && node.name !== "") {
      setNodeToCreate(node);
    }
  };
  const onChangeConfidentiality = (confidentiality) => {
    console.log("onChangeConfidentiality " + JSON.stringify(confidentiality));
    if (confidentiality !== undefined) {
      let governanceClassifications = nodeToCreate.governanceClassifications;
      if (governanceClassifications === undefined) {
        governanceClassifications = {};
      }
      governanceClassifications.confidentiality = confidentiality;

      let amendedNodeToCreate = nodeToCreate;
      amendedNodeToCreate.governanceClassifications = governanceClassifications;
      setNodeToCreate(amendedNodeToCreate);
    }
  };
  const onChangeConfidence = (confidence) => {
    console.log("onChangeConfidencd " + JSON.stringify(confidence));
    if (confidence !== undefined) {
      let governanceClassifications = nodeToCreate.governanceClassifications;
      if (governanceClassifications === undefined) {
        governanceClassifications = {};
      }
      governanceClassifications.confidence = confidence;

      let amendedNodeToCreate = nodeToCreate;
      amendedNodeToCreate.governanceClassifications = governanceClassifications;
      setNodeToCreate(amendedNodeToCreate);
    }
  };
  const onChangeCriticality = (criticality) => {
    console.log("onChangeCriticality " + JSON.stringify(criticality));
    if (criticality !== undefined) {
      let governanceClassifications = nodeToCreate.governanceClassifications;
      if (governanceClassifications === undefined) {
        governanceClassifications = {};
      }
      governanceClassifications.criticality = criticality;

      let amendedNodeToCreate = nodeToCreate;
      amendedNodeToCreate.governanceClassifications = governanceClassifications;
      setNodeToCreate(amendedNodeToCreate);
    }
  };
  const onChangeRetention = (retention) => {
    console.log("onChangeRetention " + JSON.stringify(retention));
    if (retention !== undefined) {
      let governanceClassifications = nodeToCreate.governanceClassifications;
      if (governanceClassifications === undefined) {
        governanceClassifications = {};
      }
      governanceClassifications.retention = retention;

      let amendedNodeToCreate = nodeToCreate;
      amendedNodeToCreate.governanceClassifications = governanceClassifications;
      setNodeToCreate(amendedNodeToCreate);
    }
  };
  const getTitle = () => {
    return "Create Term Wizard";
  };
  const step1Title = () => {
    return "Create";
  };
  const getStep1Label = () => {
    return "Create Term";
  };
  const getStep1Description = () => {
    return "Step 1:  Create a Term";
  };
  const step2Title = () => {
    return "Set Glossary";
  };
  const getStep2Description = () => {
    return "Step 2: A glossary needs to be chosen, to store the Term";
  };
  const step3Title = () => {
    return "Set Confidentiality";
  };
  const getStep3Description = () => {
    return "Step 3: Optionally associate Confidentiality with this Term";
  };
  const step4Title = () => {
    return "Set Confidence";
  };
  const getStep4Description = () => {
    return "Step 4: Optionally associate Confidence with this Term";
  };
  const step5Title = () => {
    return "Set Criticality";
  };
  const getStep5Description = () => {
    return "Step 5: Optionally associate Criticality with this Term";
  };
  const step6Title = () => {
    return "Set Retention";
  };
  const getStep6Description = () => {
    return "Step 6: Optionally associate Retention with this Term";
  };
  const getStep7Description = () => {
    return "Step 7: confirm the Term details, prior to create";
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
          disabled={!validateCreateDetails()}
          label="Set Glossary"
          description={getStep2Description()}
        />
        <ProgressStep
          disabled={!validateCreateDetails()}
          label="Confidentiality"
          description={getStep3Description()}
        />
        <ProgressStep
          disabled={!validateCreateDetails()}
          label="Confidence"
          description={getStep4Description()}
        />
        <ProgressStep
          disabled={!validateCreateDetails()}
          label="Criticality"
          description={getStep5Description()}
        />
        <ProgressStep
          disabled={!validateCreateDetails()}
          label="Retention"
          description={getStep6Description()}
        />
        <ProgressStep
          disabled={!isValidForConfirm()}
          label="Confirm"
          description={getStep7Description()}
        />
      </ProgressIndicator>
      {currentStepIndex === 0 && (
        <Button
          kind="secondary"
          onClick={handleGotCreateDetailsOnClick}
          disabled={!validateCreateDetails()}
        >
          Next
        </Button>
      )}
      {currentStepIndex === 0 && !nodeCreated && (
        <h3 className="create-wizard-page-title">{step1Title()}</h3>
      )}
      {currentStepIndex === 0 && (
        <div>
          <CreateNodePage
            currentNodeType={props.currentNodeType}
            parentCategoryGuid={props.parentCategoryGuid}
            onGotCreateDetails={onGotCreateDetails}
          />
        </div>
      )}

      {currentStepIndex === 1 && !nodeCreated && (
        <div>
          <Button kind="secondary" onClick={onRestart}>
            Previous
          </Button>
          <Button
            kind="secondary"
            // onClick={confirmCreateDetails}
            onClick={addConfidentiality}
            disabled={!isValidForConfirm()}
          >
            Next
          </Button>
          <h3 className="create-wizard-page-title">{step2Title()}</h3>
        </div>
      )}
      {currentStepIndex === 1 && (
        <StartingNodeNavigation
          match={props.match}
          nodeTypeName="glossary"
          onSelectCallback={onGlossarySelect}
        />
      )}

      {currentStepIndex === 2 && (
        <div>
          <Button kind="secondary" onClick={onRestart}>
            Previous
          </Button>
          <Button
            kind="secondary"
            // onClick={confirmCreateDetails}
            onClick={addConfidence}
            // disabled={!isValidForConfirm()}
          >
            Next
          </Button>
          <h3 className="create-wizard-page-title">{step3Title()}</h3>
        </div>
      )}
      {currentStepIndex === 2 && (
        <CreateGovernanceClassification
          governanceClassificationName="confidentiality"
          onGovernanceClassificationSet={onChangeConfidentiality}
        />
      )}

      {currentStepIndex === 3 && (
        <div>
          <Button kind="secondary" onClick={onRestart}>
            Previous
          </Button>
          <Button
            kind="secondary"
            // onClick={confirmCreateDetails}
            onClick={addCriticality}
            // disabled={!isValidForConfirm()}
          >
            Next
          </Button>
          <h3 className="create-wizard-page-title">{step4Title()}</h3>
        </div>
      )}
      {currentStepIndex === 3 && (
        <CreateGovernanceClassification
          governanceClassificationName="confidence"
          onGovernanceClassificationSet={onChangeConfidence}
        />
      )}

      {currentStepIndex === 4 && (
        <div>
          <Button kind="secondary" onClick={onRestart}>
            Previous
          </Button>
          <Button
            kind="secondary"
            // onClick={confirmCreateDetails}
            onClick={addRetention}
            // disabled={!isValidForConfirm()}
          >
            Next
          </Button>
          <h3 className="create-wizard-page-title">{step5Title()}</h3>
        </div>
      )}
      {currentStepIndex === 4 && (
        <CreateGovernanceClassification
          governanceClassificationName="criticality"
          onGovernanceClassificationSet={onChangeCriticality}
        />
      )}

      {currentStepIndex === 5 && (
        <div>
          <Button kind="secondary" onClick={onRestart}>
            Previous
          </Button>
          <Button kind="secondary" onClick={confirmCreateDetails}>
            Next
          </Button>
          <h3 className="create-wizard-page-title">{step6Title()}</h3>
        </div>
      )}
      {currentStepIndex === 5 && (
        <CreateGovernanceClassification
          governanceClassificationName="retention"
          onGovernanceClassificationSet={onChangeRetention}
        />
      )}
      {/* spine objects, attribute and object identifier not included here . They will be created with the has-a relationship */}

      {currentStepIndex === 6 && (
        <div>
          <CreateNodePage
            currentNodeType={props.currentNodeType}
            glossaryGuid={glossaryGuid}
            parentCategoryGuid={props.parentCategoryGuid}
            onCreateCallback={onCreate}
            nodeToCreate={nodeToCreate}
          />
        </div>
      )}
    </div>
  );
}
