/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import React, { useContext } from "react";
import { GlossaryAuthorCRUDContext } from "../../contexts/GlossaryAuthorCRUDContext";
import { FormGroup } from "carbon-components-react";
import Info16 from "@carbon/icons-react/lib/information/16";
import Close16 from "../../../../images/carbon/Egeria_close_16";

function RelationshipsView(props) {
  console.log("RelationshipsView");

  const glossaryAuthorCRUDContext = useContext(GlossaryAuthorCRUDContext);
  console.log("RelationshipsView glossaryAuthorCRUDContext", glossaryAuthorCRUDContext);
  const onClickRelationship = (e) => {
    console.log("onClickRelationship");
    alert("Got " + e.target.id);
    e.preventDefault();
  };
  const handleOnClose = (e) => {
    console.log("RelationshipsView handleOnClose");
    e.preventDefault();
    props.onClose();
  };

  const onClickNode = (e) => {
    console.log("onClickNode");
    e.preventDefault();
  };
  return (
    <div>
        <div className="close-title">
        <Close16 onClick={handleOnClose}/>
      </div>
      <FormGroup>
        <div>
          <h4>
            Relationships for{" "}
            {glossaryAuthorCRUDContext.currentNodeType
              ? glossaryAuthorCRUDContext.currentNodeType.typeName
              : ""}
           
            <Info16 />
          </h4>
        </div>
        {glossaryAuthorCRUDContext.selectedNodeRelationships && (
          <div>
            <div className="flex-grid-halves">
              <div className="col">
                <button className={`noderelationship-button relationshipShape noderelationship-title`} disabled>
                  Relationships
                </button>
              </div>
              <div className="col">
                <button className={`noderelationship-button nodeShape noderelationship-title`} disabled>
                  Connected Nodes
                </button>
              </div>
            </div>
            {glossaryAuthorCRUDContext.selectedNodeRelationships.map((relationship) => {
              return (
                <div className="flex-grid-halves">
                  <div key={relationship.guid} className="col">
                    <button
                      id={relationship.guid}
                      className={`noderelationship-button relationshipShape clickable`}
                      onClick={onClickRelationship}
                    >
                      {relationship.name}
                    </button>
                  </div>
                  <div className="col">
                    <button
                      className={`noderelationship-button nodeShape clickable`}
                      onClick={onClickNode}
                    >
                      Term TestName
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FormGroup>
    </div>
  );
}

export default RelationshipsView;
