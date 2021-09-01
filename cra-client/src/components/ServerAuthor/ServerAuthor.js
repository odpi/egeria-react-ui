/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React from "react";
import ServerAuthorContext from "./contexts/ServerAuthorContext";
import ServerAuthorWizard from"./components/ServerAuthorWizard";

export default function ServerAuthor() {
  return (
    <ServerAuthorContext>
      <ServerAuthorWizard />
    </ServerAuthorContext>
  );
}
