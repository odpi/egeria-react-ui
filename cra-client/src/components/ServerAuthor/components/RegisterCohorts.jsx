/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, { useContext, useEffect } from "react";
import { ServerAuthorContext } from "../contexts/ServerAuthorContext";
import AuthorStringList from "../../common/AuthorStringList";

export default function RegisterCohorts() {
  const {
    currentServerCohorts, setCurrentServerCohorts,
    registerCohortName, setRegisterCohortName,
    unregisterCohortName, setUnregisterCohortName,
    // calls to server
    registerCohort,
    unRegisterCohort,
  } = useContext(ServerAuthorContext);

  useEffect(() => {
    if (registerCohortName !== "") {
      registerCohort(
        registerCohortName,
        onSuccessfulRegisterCohort,
        onErrorRegisterCohort
      );
    }
  }, [registerCohortName]);

  useEffect(() => {
    if (unregisterCohortName !== "") {
      unRegisterCohort(
        unregisterCohortName,
        onSuccessfulUnRegisterCohort,
        onErrorUnRegisterCohort
      );
    }
  }, [unregisterCohortName]);

  const handleAddCohort = (cohortName) => {
    console.log("handleAddCohort() called", { cohortName });
    if (cohortName.length === 0) return;
    setRegisterCohortName(cohortName);
  };
  const handleRemoveCohort = (index) => {
    console.log("handleRemoveCohort() called", { index });
    const cohortName = currentServerCohorts[index];
    setUnregisterCohortName(cohortName);
  };

  const onSuccessfulRegisterCohort = () => {
    setCurrentServerCohorts(currentServerCohorts.concat(registerCohortName));
    document.getElementById("cohort-new-string-value").value = "";
  };
  const onErrorRegisterCohort = (error) => {
    setRegisterCohortName("");
    alert("Error registering cohort");
  };
  const onSuccessfulUnRegisterCohort = () => {
    // const cohortName = document.activeElement.id.substring(
    //   "cohort-remove-button-".length
    // );
    const cohortList = currentServerCohorts.filter((e) => e !== unregisterCohortName);
    // const cohortList = currentServerCohorts.filter((v, i) => { return i !== index });
    setCurrentServerCohorts(cohortList);
  };
  const onErrorUnRegisterCohort = (error) => {
    setUnregisterCohortName("");
    alert("Error unregistering cohort");
  };

  return (
    <AuthorStringList
      handleAddString={handleAddCohort}
      handleRemoveStringAtIndex={handleRemoveCohort}
      stringLabel={"Cohort Name"}
      idPrefix="cohort"
      stringValues={currentServerCohorts}
    />
  );
}
