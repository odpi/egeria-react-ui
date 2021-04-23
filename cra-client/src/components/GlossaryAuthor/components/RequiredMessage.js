/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useState, useEffect } from "react";

export default function RequiredMessage(props) {
  const [displayRequiredMessage, setDisplayRequiredMessage] = useState(false);

  useEffect(() => {
    console.log("RequiredMessage useEffect");
    let display = false;
    if (props.required && (props.value === undefined || props.value === "")) {
      display = true;
    }
    setDisplayRequiredMessage(display);
  }, [props]);

  
  return (
    <div>
      {displayRequiredMessage === true && (
          <span style={{ color: "red" }}>
          Required
        </span>
      )}
      {displayRequiredMessage === false && (
          <div></div>
      )}
    </div>
  );
}
