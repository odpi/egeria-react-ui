/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import PropTypes from "prop-types";

import { RepositoryServerContext } from "./RepositoryServerContext";

import { parse, format, parseISO, isValid } from "date-fns";

/*
 * The InstancesContext holds the state for the instances that are retrieved from the
 * repository and loaded into the graph. It also holds transient state that exists
 * following the completion of a search and the selection by the user of which searched
 * instances they want to add to the graph.
 *
 * The InstancesContext depends on the RepositoryServerContext for retrievals and searches.
 */
export const InstancesContext = createContext();

export const InstancesContextConsumer = InstancesContext.Consumer;

const InstancesContextProvider = (props) => {
  const repositoryServerContext = useContext(RepositoryServerContext);

  /*
   * The focusInstance is the instance (entity or relationship) that is the user's current
   * focus. It's GUID is stored in focusInstanceGUID and its category is in focusInstanceCategory.
   * These things all move together - as demonstrated in functions such as setFocusEntity().
   * When the focus instance is changed (e.g. by clicking on an instance in the diagram) the
   * whole set of focus fields is updated.
   * When the user types/pastes a GUID into the GUID field in the browser it updates the guidToLoad
   * field in the InstanceRetriever. Same for categoryToLoad. When the user presses "Get" in the
   * InstanceRetriever, the instance is retrieved from the repository and all the focus fields
   * are updated (together) as described above.
   */

  /*
   * focus is an object containing the instanceCategory, instanceGUID and the instance itself.
   */
  const [focus, setFocus] = useState({
    instanceCategory: "",
    instanceGUID: "",
    instance: null,
  });

  /*
   * gens
   * ----
   * This is where the previously retrieved instances are stored.
   * This is structured as an array of traversal objects. A traversal may contain a single instance
   * such as an entity that was retrieved using Get or Search, or it may contain a set of neighbours
   * that were retrieved as the result of an Explore traversal starting from an existing entity.
   * A gen (traversal) has the following fields:
   *   entities       - a map from entity GUID to entity digest containing the instances
   *   relationships  - a map from relaitonship GUID to relationship digest containing the instances
   *   operation      - the operation that was performed to retrieve this traversal, e.g:
   *                      "entitySearch", "relationshipSearch"
   *                    This is recorded in the traversal, to provide an informative summary in history
   *   serverName     - the name of the server whose repository returned the instances in the traversal
   *   searchText     - the searchText that was used to find the set of instance in the traversal
   *                    (The search category is implicit from the operaton and the nature of the instances)
   *
   * Initial State and Progress:
   * At the start of a session, or following a clear operation (or successive undo operations) gens
   * is empty.
   * A gen is added (to the end of the array) when a retrieval (get, search-completion  or explore)
   * completes and returns one or more instances that were not already 'known' (i.e. in a previous gen).
   * The most recent gen can be removed by an Undo operation. It is removed in the second phase of Undo.
   * Gens are identified by numeric identifiers which start at 1 - they are NOT the gens array index.
   * The number of gens (previously stored as a separate field) can be found by getting the current genId.
   *
   * The gens are accessed by other componenets using the functions:
   *   getLatestActiveGenId  - returns the most recent gen number - (previously called getCurrentGen)
   *   getLatestGen          - returns the most recent gen (not necessarily an active gen)
   *   addGen                - this encapsulates extension of a gen
   *                         - this updates the gens array and the guidToGenId map too.
   *   removeGen             - this encapsulates removal of a gen
   *                         - this updates the gens array and the guidToGenId map too.
   *                         - when a gen is removed, this method also checks whether it contained the focus - in which
   *                           case the focus is cleared.
   *
   *
   * guidToGenId
   * -----------
   * In addition to the gens themselves there is a map for quick existence checking and retrieval:
   *   guidToGenId     - maps the instance (entity or relationship) to the identifier of the gen it is in (if any)
   *
   * Initial State and Progress:
   * At the start of a session, or following a clear operation (or successive undo operations) guidToGenId
   * is empty. An entry is added to the map when a gen is added and an entry is removed when the gen removed.
   */
  const [gens, setGens] = useState([]);
  const [guidToGenId, setGuidToGenId] = useState({});
 
/**
 * Switch for using historical state
 */
  const [useHistoricalQuery,setUseHistoricalQuery] = useState(false);

  /*
   * As of time string
   */
  const [asOfTimeStr, setAsOfTimeStr] = useState();

  /*
   * As of Date  - the date part of date time as a date object
   */
  const [asOfDate, setAsOfDate] = useState();

  const [asOfFormattedDate, setAsOfFormattedDate] = useState();

  /*
   * As of date time - the date and time as a date object.
   */
  const [asOfDateTime, setAsOfDateTime] = useState();

  /*
   * As of datetime for queries = this is the datetime that the metadata calls to Egeria should be issues with.
   * If not specified then Rex uses the the latest content.
   *
   */
  const [asOfDateTimeForQueries, setAsOfDateTimeForQueries] = useState();

  /**
   * is the historical time box disabled
   */
  const [isTimeDisabled, setIsTimeDisabled] = useState(true);

  /*
   * as of DateTime string
   */

  const [asOfDateTimeStr, setAsOfDateTimeStr] = useState();

  const [invalidTime, setInvalidTime] = useState(false);

  const [invalidDate, setInvalidDate] = useState(false);

  /*
   * The latestGenId is not just the length of the gens array - it indicates the id of the most recent
   * active generation. When the array is growing it will always be the last gen in the array. But when
   * undo or clear is used, it will be either one less than the array length, or even zero (on clear).
   */
  const [latestActiveGenId, setLatestActiveGenId] = useState(0);

  useEffect(() => {
    console.log(" useEffect [useHistoricalQuery]]); " + useHistoricalQuery);
   
    // make sure that the date and time are reset .
    setAsOfTimeStr("");
    setAsOfDate(undefined);
    setAsOfFormattedDate(undefined);

    clear();
  }, [useHistoricalQuery]);

  useEffect(() => {
    console.log(" useEffect [asOfTimeStr, asOfDate]); ");
    let validatedDateTime;
    if (asOfDate) {
      // if we have a date then activate the time input
      setIsTimeDisabled(false);
      if (asOfTimeStr === undefined || asOfTimeStr === "") {
        setAsOfDateTime(asOfDate);
        setInvalidTime(false);
      } else {
        // it is confusing to the user if we allow shorter strings that parse might see as invalid e.g. 11:1, so we insist on 5 characters
        if (asOfTimeStr.length !== 5) {
          setInvalidTime(true);
          setAsOfDateTime(asOfDate);
        } else {
          validatedDateTime = parse(asOfTimeStr, "HH:mm", asOfDate);
          if (validatedDateTime) {
            if (isValid(validatedDateTime)) {
              setInvalidTime(false);
              setAsOfDateTime(validatedDateTime);
              setAsOfFormattedDate(getFormattedDate(validatedDateTime));
            } else {
              setInvalidTime(true);
              setAsOfDateTime(asOfDate);
              setAsOfFormattedDate(getFormattedDate(asOfDate));
            }
          } else {
            setInvalidTime(true);
            setAsOfDateTime(asOfDate);
            setAsOfFormattedDate(getFormattedDate(asOfDate));
          }
        }
      }
    } else {
      setAsOfDateTime(undefined);
      // no point in allowing time to be updated if there is no date
      setIsTimeDisabled(true);
      setAsOfFormattedDate(undefined);
    }
  }, [asOfTimeStr, asOfDate]);

  const getFormattedDate = (date) => {
    // the value needs to be the date string using the date-fns format
     let formattedDate = undefined;
    if (date != undefined) {
      formattedDate = format(date, "MM/dd/Y");
    }
    return formattedDate;
  };

  useEffect(() => {
    // the clear the context if the date time has changed then existing content should be thrown 
    clear()
    if (asOfDateTime !== undefined) {
      console.log("useEffect 1- [asOfDateTimeForQueries, asOfDateTime])");
      setAsOfDateTimeStr(format(asOfDateTime, "PPPPpppp"));
      console.log(
        "useEffect 1- format(asOfDateTime, PPPPpppp) " +
          format(asOfDateTime, "PPPPpppp")
      );
      // set the date using the time from epoc- this should now be a UTC date with no local formatting
      // in the date object.
      console.log("useEffect 2- [asOfDateTimeForQueries, asOfDateTime])");
      setAsOfDateTimeForQueries(asOfDateTime.getTime());
      console.log("useEffect 3- [asOfDateTimeForQueries, asOfDateTime])");
    } else {
      console.log("useEffect 4- [asOfDateTimeForQueries, asOfDateTime])");
      setAsOfDateTimeForQueries(undefined);
      setAsOfDateTimeStr(undefined);
    }
  }, [asOfDateTime]);
  /*
   * getLatestActiveGenId  - returns the most recent gen number that is active
   */
  const getLatestActiveGenId = useCallback(() => {
    return latestActiveGenId;
  }, [latestActiveGenId]);

  /*
   * getLatestGen  - returns the most recent gen - this may not be an active gen.
   */
  const getLatestGen = useCallback(() => {
    return gens[gens.length - 1];
  }, [gens]);

  /*
   * General failure reporting utility
   *
   *
   * This function provides a common utility for reporting errors to the user.
   * For now these are posted as alerts. That could be modified.
   * The 'operation' parameter should be a phrase that describes the operation in a non-technical
   * manner that matches the context and concepts the user will be familiar with. For example,
   * use a phrase like "get types for server" rather than "loadTypes".
   * The second parameter is a json response object that has the fields from the associated
   * RexViewServiceException. The main fields to note are (with example values):
   *  relatedHTTPCode                 :  400,
   *  exceptionClassName              : 'org.odpi.openmetadata.viewservices.rex.api.ffdc.RexViewServiceException',
   *  actionDescription               : 'getTypeExplorer',
   *  exceptionErrorMessage           : 'The repository explorer view service operation getTypeExplorer found that platform for server Metadata_Server2 is not available',
   *  exceptionErrorMessageId         : 'OMVS-REPOSITORY-EXPLORER-400-006',
   *  exceptionErrorMessageParameters : [ 'getTypeExplorer', 'Metadata_Server2' ],
   *  exceptionSystemAction           : 'The system reported that the platform is not reachable using the provided URL.',
   *  exceptionUserAction             : 'Check the platform is running and check the repository explorer resource endpoint configuration for the server and its platform.'
   * The exceptionErrorMessageParameters will already have been substituted into the exceptionErrorMessage,
   * so there should be no need to perform any formatting; that is all done by the view service.
   *
   */
  const reportFailedOperation = useCallback((operation, json) => {
    if (json !== null) {
      const relatedHTTPCode = json.relatedHTTPCode;
      const exceptionMessage = json.exceptionErrorMessage;

      let message =
        "Could not " +
        operation +
        " (status : " +
        relatedHTTPCode +
        "). " +
        exceptionMessage;
      message = message + "\n\nSystem detail: " + json.exceptionSystemAction;
      message =
        message + "\n\nRecommended user action: " + json.exceptionUserAction;
      alert(message);
    } else {
      alert(
        "Attempt to " +
          operation +
          " did not get a JSON response from the view server"
      );
    }
  }, []);

  /*
   * addGen - updates the gens array and the guidToGenId map too.
   */
  const addGen = useCallback(
    (traversal) => {
      /*
       * The traversal contains new instances (entities and/or relationships) - that do
       * not already existing in previous gens.
       */

      /*
       * Do not mutate the current array - must replace for state update to register
       */
      const newList = gens.concat(traversal);
      setGens(newList);
      setLatestActiveGenId(newList.length);

      /*
       * Look for new instances in the traversal, and add them to the new gen.
       * If it was an entity that was processed, this function will only have been called if the entity
       * needs adding to the new gen - so no checking would be required. However, if it was a relationship
       * that was processed it carries a pair of entity digests and they may or may not have been already
       * known; the relationship processor will have already checked for pre-existence and set their genIds
       * accordingly.This function needs to check each entity's genId - and only add the ones for the new
       * gen.
       * If an entity is from the new gen, record it in the guidToGenId map. Relationships will always be
       * from the new gen.
       * Because the map is immutable, corral the changes in a cloned map and apply them in one replace operation
       */
      const newGen = newList.length;
      let newEntries = Object.assign({}, guidToGenId);
      const eKeys = Object.keys(traversal.entities);
      eKeys.forEach((e) => {
        newEntries[e] = newGen;
      });
      const rKeys = Object.keys(traversal.relationships);
      rKeys.forEach((r) => {
        newEntries[r] = newGen;
      });
      /*
       * Now replace the map...
       */
      setGuidToGenId(newEntries);
    },
    [gens, setGens, guidToGenId, setGuidToGenId, setLatestActiveGenId]
  );

  /*
   * setFocusEntity sets the category, instance, guid for the focus instance.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const setFocusEntity = useCallback((expEntity) => {
    const newFocus = {
      instanceCategory: "Entity",
      instanceGUID: expEntity.entityDetail.guid,
      instance: expEntity,
    };
    setFocus(newFocus);
  }, []);

  /*
   * setFocusRelationship sets the category, instance, guid for the focus instance.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const setFocusRelationship = useCallback(
    (expRelationship) => {
      const newFocus = {
        instanceCategory: "Relationship",
        instanceGUID: expRelationship.relationship.guid,
        instance: expRelationship,
      };
      setFocus(newFocus);
    },
    [setFocus]
  );

  /*
   * Get the GUID of the focus instance
   */
  const getFocusGUID = useCallback(() => {
    return focus.instanceGUID;
  }, [focus]);

  /*
   * Get the gen containing the focus instance
   */
  const getFocusGen = useCallback(() => {
    let focusGenId = guidToGenId[focus.instanceGUID];
    let focusGen = gens[focusGenId - 1];
    return focusGen;
  }, [guidToGenId, gens, focus.instanceGUID]);

  /*
   * Get the id of the gen containing the focus instance
   */
  const getFocusGenId = useCallback(() => {
    let focusGenId = guidToGenId[focus.instanceGUID];
    return focusGenId;
  }, [guidToGenId, focus]);

  /*
   * Functions to process retrieved instances
   */

  /*
   * processRetrievedEntity accepts an expEntity, checks whether it is already known and if not,
   * creates a traversal to add the entity to a new gen
   */
  const processRetrievedEntity = useCallback(
    (expEntity) => {
      const serverName = expEntity.serverName;
      const platformName = expEntity.platformName;
      const entityGUID = expEntity.entityDigest.entityGUID;

      let genId;
      if (guidToGenId[entityGUID] !== undefined) {
        /*
         * Entity is already known
         */
        genId = guidToGenId[entityGUID];
        expEntity.entityDigest.gen = genId;
        // If the entity was originally loaded as a proxy restore its provenance...
        let gen = gens[genId - 1];
        let originalEntity = gen.entities[entityGUID];
        if (originalEntity.provenance === "proxy") {
          expEntity.entityDigest.provenance = "proxy";
        }
      } else {
        /*
         * Entity is not already known
         *
         * Construct a traversal for the entity and add it to the gens.
         * The genId is in the digest and will be one beyond the current latest gen
         */
        genId = getLatestActiveGenId() + 1;
        expEntity.entityDigest.gen = genId;

        let rexTraversal = {};
        rexTraversal.entities = {};
        rexTraversal.relationships = {};
        rexTraversal.entities[entityGUID] = expEntity.entityDigest;
        rexTraversal.serverName = serverName;
        rexTraversal.platformName = platformName;
        rexTraversal.operation = "getEntity";
        rexTraversal.enterpriseOption =
          expEntity.entityDigest.provenance === "ent";

        /*
         * Add the traversal to the sequence of gens in the graph.
         */
        addGen(rexTraversal);
      }

      /*
       * Because this is processing the retrieval of a single entity, that entity becomes the focus
       */
      setFocusEntity(expEntity);
    },
    [addGen, getLatestActiveGenId, guidToGenId, gens, setFocusEntity]
  );

  /*
   * processRetrievedRelationship accepts an expRelationship, checks whether it is already known and if not,
   * creates a traversal to add the relationship to a new gen
   */
  const processRetrievedRelationship = useCallback(
    (expRelationship) => {
      const serverName = expRelationship.serverName;
      const platformName = expRelationship.platformName;
      const relationshipGUID =
        expRelationship.relationshipDigest.relationshipGUID;

      let genId;
      if (guidToGenId[relationshipGUID] !== undefined) {
        /*
         * Relationship is already known
         */
        genId = guidToGenId[relationshipGUID];
        expRelationship.relationshipDigest.gen = genId;
      } else {
        /*
         * Relationship is not already known
         *
         * Construct a traversal for the relationship and add it to the gens.
         * The genId is in the digest and will be one beyond the current latest gen
         */
        genId = getLatestActiveGenId() + 1;
        expRelationship.relationshipDigest.gen = genId;

        let rexTraversal = {};
        rexTraversal.entities = {};
        rexTraversal.relationships = {};
        rexTraversal.relationships[relationshipGUID] =
          expRelationship.relationshipDigest;
        rexTraversal.serverName = serverName;
        rexTraversal.platformName = platformName;
        rexTraversal.operation = "getRelationship";
        rexTraversal.enterpriseOption =
          expRelationship.relationshipDigest.provenance === "ent";

        /*
         * We need to retrieve the end entity digests from the expRelationship and find out
         * whether each end entity is new or known, so they can either keep their gens or be
         * assigned the next gen...
         */

        /*
         * entityOne
         */
        const entityOneDigest = expRelationship.entityOneDigest;
        const entityOneGUID = entityOneDigest.entityGUID;

        /*
         * Determine whether entityOne is already known. This could loop through the gens
         * but it is slightly more efficient to use the guidToGen map as a direct index.
         */
        let entityOneKnown = false;
        let e1gen;
        if (guidToGenId[entityOneGUID] !== undefined) {
          entityOneKnown = true;
          e1gen = guidToGenId[entityOneGUID];
        }
        if (entityOneKnown === false) {
          e1gen = genId;
        }
        entityOneDigest.gen = e1gen;

        /*
         * entityTwo
         */
        const entityTwoDigest = expRelationship.entityTwoDigest;
        const entityTwoGUID = entityTwoDigest.entityGUID;

        /*
         * Determine whether entityTwo is already known. This could loop through the gens
         * but it is slightly more efficient to use the guidToGen map as a direct index.
         */
        let entityTwoKnown = false;
        let e2gen;
        if (guidToGenId[entityTwoGUID] !== undefined) {
          entityTwoKnown = true;
          e2gen = guidToGenId[entityTwoGUID];
        }
        if (entityTwoKnown === false) {
          e2gen = genId;
        }
        entityTwoDigest.gen = e2gen;

        /*
         * Add the entity digests to the traversal ONLY if they are new in this gen
         */
        if (!entityOneKnown) {
          rexTraversal.entities[entityOneGUID] = entityOneDigest;
        }
        if (!entityTwoKnown) {
          rexTraversal.entities[entityTwoGUID] = entityTwoDigest;
        }

        /*
         * Add the traversal to the sequence of gens in the graph.
         */
        addGen(rexTraversal);
      }

      /*
       * Because this is processing the retrieval of a single relationship, that relationship becomes the focus
       */
      setFocusRelationship(expRelationship);
    },
    [addGen, getLatestActiveGenId, guidToGenId, setFocusRelationship]
  );

  /*
   * processRetrievedTraversal accepts a RexTraversal, and parses it, checking whether each instance it contains is
   * already known. If there are any new instances, creates a traversal to add the instances to a new gen.
   */
  const processRetrievedTraversal = useCallback(
    (rexTraversal) => {
      /*
       * If this is a traversal from an Explore, the traversal results should have been formatted by the VS
       * into the form needed by Rex.
       * This means that it should have:
       *   a map of entityGUID       --> { entityGUID, label, gen }
       *   a map of relationshipGUID --> { relationshipGUID, end1GUID, end2GUID, idx, label, gen }
       *
       * Alternatively this could be a traversal object resulting from a search and subsequent user
       * selection of search results.
       *
       * For each entity and relationship in the traversal response we need to determine whether it
       * is known or new. Anything known is dropped from the traversal, which is then pushed to the
       * logically next gen, setting the gen in each digest accordingly.
       */

      /* Assume initially that the traversal contains new information; if so it will be added to
       * the next gen, calculated below. If nothing new is learned from the traversal then we
       * will not update the current gen.
       *
       * Notice that the currentGen is NOT advanced at this stage - this will only happen if the
       * traversal contains new metadata objects.
       */

      const genId = getLatestActiveGenId() + 1;

      /*
       * Process entities...
       * Anything that is known should be removed from the traversal.
       * Anything new can remain and should be assigned the next gen.
       */
      const entities = rexTraversal.entities;
      if (entities) {
        const eKeys = Object.keys(entities);

        eKeys.forEach((eKey) => {
          const entity = entities[eKey];
          const entityGUID = entity.entityGUID;

          /*
           * Determine whether entity is already known ...
           */
          let entityKnown = false;
          if (guidToGenId[entityGUID] !== undefined) {
            entityKnown = true;
          }
          if (entityKnown === true) {
            /*
             * Remove the entity from the traversal
             */
            delete rexTraversal.entities[entityGUID];
          } else {
            /*
             * Update the new entity's gen
             */
            rexTraversal.entities[entityGUID].gen = genId;
          }
        });
      }

      /*
       * Process relationships...
       * These are in a map of RexExpandedRelationship objects, inside of
       * which are the RexRelationshipDigest objects.
       * Anything that is known should be removed from the traversal.
       * Anything new can remain and should be assigned the next gen.
       */
      const relationships = rexTraversal.relationships;
      if (relationships) {
        const rKeys = Object.keys(relationships);

        rKeys.forEach((rKey) => {
          const relationship = relationships[rKey];
          const relationshipGUID = relationship.relationshipGUID;

          /*
           * Determine whether relationship is already known ...
           */
          let relationshipKnown = false;
          if (guidToGenId[relationshipGUID] !== undefined) {
            relationshipKnown = true;
          }
          if (relationshipKnown === true) {
            /*
             * Remove the relationship from the traversal
             */
            delete rexTraversal.relationships[relationshipGUID];
          } else {
            /*
             * Relationship is new.
             * Update the new relationship's gen
             */
            rexTraversal.relationships[relationshipGUID].gen = genId;
          }
        });
      }

      /*
       * If there is anything new still in the traversal,
       *   -  each new instance has been assigned (above) the next gen; advance the value of currentGen.
       *   -  push the traversal into the appropriate position in gens
       *   -  generate a graph-changed event
       * else
       *   -  display a message saying that nothing new was learned.
       */
      const no_entities =
        rexTraversal.entities === undefined ||
        Object.keys(rexTraversal.entities).length === 0;
      const no_relationships =
        rexTraversal.relationships === undefined ||
        Object.keys(rexTraversal.relationships).length === 0;

      if (no_entities && no_relationships) {
        /*
         * This is not an error - it just means everything in the traversal was already known,
         * which can happen.
         * However, it is desirable to advise the user that nothing new was returned, which should explain why
         * there will be no visible change to the display.
         */
        alert("No additional objects were returned in the traversal");
      } else {
        /*
         * For what it's worth - set the gen at the traversal level (the contained objects already have
         * gen set)
         */
        rexTraversal.gen = genId;

        /*
         * Add the traversal to the sequence of gens in the graph. Then generate the graph-changed event.
         */
        addGen(rexTraversal);
      }
    },
    [addGen, getLatestActiveGenId, guidToGenId]
  );

  /*
   * Callback for completion of loadEntity
   */
  const _loadEntity = useCallback(
    (json) => {
      if (json !== null) {
        if (json.relatedHTTPCode === 200) {
          /*
           * Should have an expandedEntityDetail, if the entity was not found the response
           * will have included a non 200 status code and an EntityNotKnownException
           */
          let expEntity = json.expandedEntityDetail;
          if (expEntity) {
            processRetrievedEntity(expEntity);
            return;
          }
        }
      }
      /*
       * On failure ...
       */
      reportFailedOperation("get entity", json);
    },
    [processRetrievedEntity, reportFailedOperation]
  );

  /*
   * Function to get entity by GUID from the specified repository server
   */
  const loadEntityFromSpecifiedServer = useCallback(
    (serverName, platformName, enterpriseOption, entityGUID) => {
      repositoryServerContext.callPOST(
        serverName,
        platformName,
        "instances/entity",
        { entityGUID: entityGUID, enterpriseOption: enterpriseOption },
        _loadEntity
      );
    },
    [_loadEntity, repositoryServerContext]
  );

  /*
   * Function to get entity by GUID from the currently selected repository server
   */
  const loadEntity = useCallback(
    (entityGUID) => {
      let rexFindBody = {
        entityGUID: entityGUID,
      };

      // if there is an as of time set to use for queries then include it on the find.
      if (asOfDateTimeForQueries !== undefined) {
        rexFindBody.asOfTime = asOfDateTimeForQueries;
      }

      repositoryServerContext.repositoryPOST(
        "instances/entity",
        rexFindBody,
        _loadEntity
      );
    },
    [_loadEntity, repositoryServerContext]
  );

  /*
   * Callback for completion of loadRelationship
   */
  const _loadRelationship = useCallback(
    (json) => {
      if (json !== null) {
        if (json.relatedHTTPCode === 200) {
          /*
           * Should have an expandedRelationship, if the relationship was not found the response
           * will have included a non 200 status code and a RelationshipNotKnownException
           */
          let expRelationship = json.expandedRelationship;
          if (expRelationship !== null) {
            processRetrievedRelationship(expRelationship);
            return;
          }
        }
      }
      /*
       * On failure ...
       */
      reportFailedOperation("get relationship", json);
    },
    [processRetrievedRelationship, reportFailedOperation]
  );

  /*
   * Function to get relationship by GUID from the specified repository server
   */
  const loadRelationshipFromSpecifiedServer = useCallback(
    (serverName, platformName, enterpriseOption, relationshipGUID) => {
      repositoryServerContext.callPOST(
        serverName,
        platformName,
        "instances/relationship",
        {
          relationshipGUID: relationshipGUID,
          enterpriseOption: enterpriseOption,
        },
        _loadRelationship
      );
    },
    [_loadRelationship, repositoryServerContext]
  );

  /*
   * Function to get relationship by GUID from the repository
   */
  const loadRelationship = useCallback(
    (relationshipGUID) => {
      let rexFindBody = {
        relationshipGUID: relationshipGUID,
      };

      // if there is an as of time set to use for queries then include it on the find.
      if (asOfDateTimeForQueries !== undefined) {
        rexFindBody.asOfTime = asOfDateTimeForQueries;
      }
      repositoryServerContext.repositoryPOST(
        "instances/relationship",
        rexFindBody,
        _loadRelationship
      );
    },
    [_loadRelationship, repositoryServerContext]
  );

  /*
   * clearFocusInstance resets the category, instance, guid for the focus instance
   * to a state in which nothing is selected - there is no focus.
   * This operation is atomic (all three aspects are updated as one state change) to avoid sequqncing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if
   * the category does not match the other aspects, they will be very confused.
   */
  const clearFocusInstance = useCallback(() => {
    const newFocus = {
      instanceCategory: "Entity",
      instanceGUID: "",
      instance: null,
    };
    setFocus(newFocus);
  }, [setFocus]);

  /*
   * A component has requested that the focus is changed to the entity with the specified GUID.
   */
  const changeFocusEntity = useCallback(
    (entityGUID) => {
      /*
       * If the entity is the current focus - deselect it.
       */

      if (entityGUID === focus.instanceGUID) {
        clearFocusInstance();
      } else {
        /*
         * The entity was retrieved from the server identified by serverName in the gen.
         * The setting of enterpriseOption at the time is also recorded in the gen.
         * The home metadataCollection (Name and Id) are both recorded in the entityDigest (in the gen).
         *
         * The entity may have been a home entity or reference copy when it was retrieved - that
         * doesn't matter, it should be retrieable from the same server used when the digest was
         * originally loaded.
         * The entity may be marked as 'ent' - which means it was an enterprise operation (this can be
         * verified by looking at enterpriseOption in the gen) - in which case Rex does not know which server
         * contributed it - but it shouldn't matter, it should be possible to retrieve it the same way - i.e.
         * use the original server and set enterpriseOption.
         * The entity could have been a proxy generated when a relationship was searched/retrieved. In
         * this case it may or may not be accessible from the search used to retrieve the relationship.
         * If it is (i.e. the server has a local or ref copy) then that should be loaded. If it is not
         * then we should either:
         *    * advise the user that it was only a proxy and we don't know where a real copy exists (hmmm)
         *    * OR do something more helpful - but we are only armed with the mdcName and mdcId and do not
         *    * necessarily know which server we should ask. Can we correlate servers and mdcs??????
         *    * If not, maybe the best approach would be to (quietly)
         *    * perform an enterprise get by GUID (using the original gen server) and if we find it great
         *    * and if we don't find it, then advise the user....?
         *    * Consider that the server list may not contain any server that has a copy - so an enterprise
         *    * retrieval is the best we could hope for,
         *
         */
        if (guidToGenId[entityGUID] !== undefined) {
          const genId = guidToGenId[entityGUID];
          const gen = gens[genId - 1];
          const entityDigest = gen.entities[entityGUID];
          const provenance = entityDigest.provenance;
          const serverName = gen.serverName;
          const platformName = gen.platformName;
          const enterpriseOption = gen.enterpriseOption;

          switch (provenance) {
            case "home":
              /*
               * This should be the 'easy' case - the original server was the home for the entity
               * Issue a POST to the original server. That requires that we know the serverName and
               * platformName. Whether or not enterprise option was used for the original operation,
               * since we are going to ask the home repo server for the entity, we should be able to
               * do so without enterprise operation. (It should no harm to enable enterprise, since any
               * ref copy that is found must be at least the same version as the home instance. There
               * seems little point using enterprise though when we think we know where to look...)
               */
              loadEntityFromSpecifiedServer(
                serverName,
                platformName,
                false,
                entityGUID
              );
              break;

            case "refCopy":
              /*
               * This should be another 'easy' case - the original server was not the home for the entity
               * but it held a reference copy.
               * Issue a POST to the original server. That requires that we know the serverName and
               * platformName. We know whether enterprise option was used for the original operation and
               * whilst it is tempting to unilaterally turn it on here, to ensure that the highest
               * possible version of the instance is found, assuming that an enterprise load might retrieve
               * an updated version of the home, which is newer than the ref copy on the server we asked
               * previously..... Rex should not try to second guess what the user wants to do - the user
               * may specifically want to see the copy on the specified server. Therefore leave enterprise
               * as it was on the original operation.
               */
              loadEntityFromSpecifiedServer(
                serverName,
                platformName,
                enterpriseOption,
                entityGUID
              );
              break;

            case "proxy":
              /*
               * This case is more subtle than the others. The entity was 'found' as a result of it being
               * a proxy in one end of a relationship. The entity might not actually have
               * been retrieved until now, and might not even exist. If it does exist, the entity might not
               * be on the same server as the one that returned the relationship, although that server *might*
               * be holding the home or a reference copy of the entity. The best Rex can do here is to
               * try to get the entity (using the original server) with the enterprise option enabled
               * and provide an advisory message to the user if the entity is not found.
               */
              loadEntityFromSpecifiedServer(
                serverName,
                platformName,
                true,
                entityGUID
              );
              break;

            case "ent":
              /*
               * This case indicates that the entity was originally returned by the server and the
               * enterprise option was enabled. This meant that it was not possible to know where
               * the entity was homed and where the ref copies existed, or which was processed, because
               * all the results were federated and made available by the enterprise metadata collection.
               * It's not a problem, it just means that to stand the best chance of reloading the entity
               * Rex should use the same server and set the enterprise option.
               */
              loadEntityFromSpecifiedServer(
                serverName,
                platformName,
                true,
                entityGUID
              );
              break;

            default:
              alert(
                "Unknown value " +
                  provenance +
                  " for instance provenance was encountered"
              );
              break;
          }
        }
      }
    },
    [
      focus,
      guidToGenId,
      gens,
      clearFocusInstance,
      loadEntityFromSpecifiedServer,
    ]
  );

  /*
   * A component has requested that the focus is changed to the relationship with the specified GUID.
   */
  const changeFocusRelationship = useCallback(
    (relationshipGUID) => {
      /*
       * If the relationship is the current focus - deselect it.
       */

      if (relationshipGUID === focus.instanceGUID) {
        clearFocusInstance();
      } else {
        /*
         * The relationship was retrieved from the server identified by serverName in the gen.
         * The setting of enterpriseOption at the time is also recorded in the gen.
         * The home metadataCollection (Name and Id) are both recorded in the relationshipDigest (in the gen).
         *
         * The relationship may have been a home relationship or reference copy when it was retrieved - that
         * doesn't matter, it should be retrievable from the same server used when the digest was
         * originally loaded.
         * The relationship may be marked as 'ent' - which means it was an enterprise operation (this can be
         * verified by looking at enterpriseOption in the gen) - in which case Rex does not know which server
         * contributed it - but it shouldn't matter, it should be possible to retrieve it the same way - i.e.
         * use the original server and set enterpriseOption.
         */
        if (guidToGenId[relationshipGUID] !== undefined) {
          const genId = guidToGenId[relationshipGUID];
          const gen = gens[genId - 1];
          const relationshipDigest = gen.relationships[relationshipGUID];
          const provenance = relationshipDigest.provenance;
          const serverName = gen.serverName;
          const platformName = gen.platformName;
          const enterpriseOption = gen.enterpriseOption;

          switch (provenance) {
            case "home":
              /*
               * This should be the 'easy' case - the original server was the home for the relationship
               * Issue a POST to the original server. That requires that we know the serverName and
               * platformName. Whether or not enterprise option was used for the original operation,
               * since we are going to ask the home repo server for the relationship, we should be able to
               * do so without enterprise operation. (It should do no harm to enable enterprise, since any
               * ref copy that is found must be at least the same version as the home instance. There
               * seems little point using enterprise though when we think we know where to look...)
               */
              loadRelationshipFromSpecifiedServer(
                serverName,
                platformName,
                false,
                relationshipGUID
              );
              break;

            case "refCopy":
              /*
               * This should be another 'easy' case - the original server was not the home for the relationship
               * but it held a reference copy.
               * Issue a POST to the original server. That requires that we know the serverName and
               * platformName. We know whether enterprise option was used for the original operation and
               * whilst it is tempting to unilaterally turn it on here, to ensure that the highest
               * possible version of the instance is found, assuming that an enterprise load might retrieve
               * an updated version of the home, which is newer than the ref copy on the server we asked
               * previously..... Rex should not try to second guess what the user wants to do - the user
               * may specifically want to see the copy on the specified server. Therefore leave enterprise
               * as it was on the original operation.
               */
              loadRelationshipFromSpecifiedServer(
                serverName,
                platformName,
                enterpriseOption,
                relationshipGUID
              );
              break;

            case "ent":
              /*
               * This case indicates that the relationship was originally returned by the server and the
               * enterprise option was enabled. This meant that it was not possible to know where
               * the relationship was homed and where the ref copies existed, or which was processed, because
               * all the results were federated and made available by the enterprise metadata collection.
               * It's not a problem, it just means that to stand the best chance of reloading the relationship
               * Rex should use the same server and set the enterprise option.
               */
              loadRelationshipFromSpecifiedServer(
                serverName,
                platformName,
                true,
                relationshipGUID
              );
              break;

            default:
              alert(
                "Unknown value " +
                  provenance +
                  " for instance provenance was encountered"
              );
              break;
          }
        }
      }
    },
    [
      clearFocusInstance,
      focus.instanceGUID,
      gens,
      guidToGenId,
      loadRelationshipFromSpecifiedServer,
    ]
  );

  /*
   * Helper function to retrieve focus entity
   */
  const getFocusCategory = useCallback(() => {
    if (
      focus.instanceCategory === "Entity" ||
      focus.instanceCategory === "Relationship"
    ) {
      return focus.instanceCategory;
    }
    return null;
  }, [focus.instanceCategory]);

  /*
   * Helper function to retrieve focus entity
   */
  const getFocusEntity = useCallback(() => {
    if (focus.instanceCategory === "Entity") {
      if (focus.instance !== null) {
        return focus.instance;
      }
    }
    return null;
  }, [focus.instance, focus.instanceCategory]);

  /*
   * Helper function to retrieve focus entity
   */
  const getFocusRelationship = useCallback(() => {
    if (focus.instanceCategory === "Relationship") {
      if (focus.instance !== null) {
        return focus.instance;
      }
    }
    return null;
  }, [focus.instance, focus.instanceCategory]);

  const _explore = useCallback(
    (json) => {
      if (json !== null) {
        if (json.relatedHTTPCode === 200) {
          /*
           * Should have a traversal object
           */
          let rexTraversal = json.rexTraversal;
          if (rexTraversal !== null) {
            rexTraversal.operation = "traversal";
            processRetrievedTraversal(rexTraversal);
            return;
          }
        }
      }
      /*
       * On failure ...
       */
      reportFailedOperation("explore neighborhood around entity", json);
    },
    [processRetrievedTraversal, reportFailedOperation]
  );

  /*
   * Function to explore the neighborhood around the current focus entity
   * Parmeters: list of typeGUIDs for each of te three categories.
   */
  const explore = useCallback(
    (
      selectedEntityTypes,
      selectedRelationshipTypes,
      selectedClassificationTypes
    ) => {
      let rexFindBody = {
        entityGUID: getFocusGUID(),
        depth: 1, // depth is always limited to 1
        entityTypeGUIDs: selectedEntityTypes,
        relationshipTypeGUIDs: selectedRelationshipTypes,
        classificationNames: selectedClassificationTypes,
      };

      // if there is an as of time set to use for queries then include it on the find.
      if (asOfDateTimeForQueries !== undefined) {
        rexFindBody.asOfTime = asOfDateTimeForQueries;
      }
      repositoryServerContext.repositoryPOST(
        "instances/traversal",
        rexFindBody,
        _explore
      );
    },
    [_explore, getFocusGUID, repositoryServerContext]
  );

  /*
   * Remove a generation from the graph
   */
  const removeGen = useCallback(() => {
    /*
     * Remove the most recent gen from the active gens. This should be noticed by the DiagramManager
     * which will update the diagram data, and callback to the removeGenComplete callback.
     */

    /*
     *  Check there is at least one gen.
     */
    if (gens.length <= 0) {
      return;
    }

    /*
     * If the gen to be popped contains the focus instance, clear the focus.
     */
    let focusGenId = guidToGenId[focus.instanceGUID];
    if (focusGenId === gens.length) {
      clearFocusInstance();
    }

    /*
     * Do not mutate the current array - replace for state update to register
     */
    let newList = Object.assign([], gens);
    const removedGen = newList.pop();

    setGens(newList);
    setLatestActiveGenId(newList.length);

    /*
     * Look for instances that were added in the removedGen, and remove then from the guidToGenId map.
     * Because the map is immutable, corral the changes in a cloned map and apply them in one replace operation
     */

    let newGUIDMap = Object.assign({}, guidToGenId);
    const eKeys = Object.keys(removedGen.entities);
    eKeys.forEach((e) => {
      delete newGUIDMap[e];
    });
    const rKeys = Object.keys(removedGen.relationships);
    rKeys.forEach((r) => {
      delete newGUIDMap[r];
    });
    /*
     * Now replace the map...
     */
    setGuidToGenId(newGUIDMap);
  }, [clearFocusInstance, focus.instanceGUID, gens, guidToGenId]);

  /*
   * Clear the state of the session - this includes the gens, the focus and the guidToGenId map.
   * Reset the searchCategory to Entity and the CategoryToLoad to Entity.
   */
  const clear = useCallback(() => {
    /*
     * Reset the focusInstance
     */
    clearFocusInstance();

    /*
     * Empty the graph
     */
    const emptyArray = [];
    setGens(emptyArray);
    setLatestActiveGenId(0);

    /*
     * Empty the map
     */
    const emptymap = {};
    setGuidToGenId(emptymap);
  }, [clearFocusInstance]);

  /*
   * getHistory compiles a history list describing the exploration from gen 1 onwards.
   */
  const getHistory = useCallback(() => {
    let historyList = [];

    /*
     * Each gen consists of the following:
     *
     *   private String               entityGUID;               -- must be non-null
     *   private List<String>         entityTypeGUIDs;          -- a list of type guids or null
     *   private List<String>         relationshipTypeGUIDs;    -- a list of type guids or null
     *   private List<String>         classificationNames;      -- a list of names or null
     *   private Integer              depth;                    -- the depth used to create the subgraph
     *   private Integer              gen;                      -- which generation this subgraph pertains to
     *
     *   There are also fields that contain maps of instance summaries.
     *   An instance summary is much smaller than the full instance.
     *   The entities map is keyed by entityGUID and the value part consists of
     *       { entityGUID, label, gen }
     *   The relationships map is keyed by relationshipGUID and the value part consists of
     *       { relationshipGUID, end1GUID, end2GUID, idx, label, gen }
     *   The above value types are described by the RexEntityDigest and RexRelationshipDigest Java classes.
     *   private Map<String,RexEntityDigest>         entities;
     *   private Map<String,RexRelationshipDigest>   relationships;
     *
     *   The traversal is augmented in the client by the addition of an operation field. This is only meaningful in the
     *   client code.
     *   private String                operation  - has values { 'getEntity' | 'getRelationship' | 'traversal' }
     */

    for (let i = 0; i < gens.length; i++) {
      const gen = i + 1;
      const genContent = gens[i];

      /*
       *  Build the query description
       */

      /*
       * The querySummary always starts with the Repository Server's name
       */

      const serverName = genContent.serverName;
      let querySummary = "[" + serverName + "]";
      const enterpriseOption = genContent.enterpriseOption;
      querySummary = querySummary.concat(
        enterpriseOption ? " Enterprise" : " Local"
      );

      switch (genContent.operation) {
        case "getEntity":
          /*
           * Format querySummary as "Entity retrieval \n GUID: <guid>"
           */
          querySummary = querySummary.concat(" Entity retrieval using GUID");
          break;

        case "getRelationship":
          /*
           * Format querySummary as "Relationship retrieval \n GUID: <guid>"
           */
          querySummary = querySummary.concat(
            " Relationship retrieval using GUID"
          );
          break;

        case "traversal":
          /*
           * Format querySummary as "Traversal"
           * Would like to present user with label rather than guid. genContent.root contains GUID.
           * The reason for the lookup is that the root of the traversal will not be in the same gen
           * as the traversal results. It is not known which gen it is (except it must have existed prior
           * to traversal).
           */
          {
            const entityGUID = genContent.entityGUID;
            const rootGenNumber = guidToGenId[entityGUID];
            const rootGen = gens[rootGenNumber - 1];
            const rootDigest = rootGen.entities[entityGUID];
            const rootLabel = rootDigest.label;
            querySummary = querySummary.concat(
              " Traversal from entity " + rootLabel
            );
            querySummary = querySummary.concat(" Depth: " + genContent.depth);

            /*
             * Entity Type Filters - show type names rather than type GUIDs
             */
            querySummary = querySummary.concat(" Entity Type Filters: ");
            var entityTypeNames = genContent.entityTypeNames;
            if (entityTypeNames !== undefined && entityTypeNames !== null) {
              let first = true;
              entityTypeNames.forEach(function (etn) {
                if (first) {
                  first = false;
                  querySummary = querySummary.concat(etn);
                } else {
                  querySummary = querySummary.concat(", " + etn);
                }
              });
            } else querySummary = querySummary.concat("none");
          }

          /*
           * Relationship Type Filters - show type names rather than type GUIDs
           */
          querySummary = querySummary.concat(" Relationship Type Filters: ");
          var relationshipTypeNames = genContent.relationshipTypeNames;
          if (
            relationshipTypeNames !== undefined &&
            relationshipTypeNames !== null
          ) {
            let first = true;
            relationshipTypeNames.forEach(function (rtn) {
              if (first) {
                first = false;
                querySummary = querySummary.concat(rtn);
              } else {
                querySummary = querySummary.concat(", " + rtn);
              }
            });
          } else querySummary = querySummary.concat("none");

          /*
           * Classification Filters - shown as names
           */
          querySummary = querySummary.concat(" Classification Filters: ");
          var ClassificationNames = genContent.ClassificationNames;
          if (
            ClassificationNames !== undefined &&
            ClassificationNames !== null
          ) {
            let first = true;
            ClassificationNames.forEach(function (rtn) {
              if (first) {
                first = false;
                querySummary = querySummary.concat(rtn);
              } else {
                querySummary = querySummary.concat(", " + rtn);
              }
            });
          } else querySummary = querySummary.concat("none");

          break;

        case "entitySearch":
          /*
           * Format querySummary as "Entity Search Expression [<expr>] <guid>"
           */
          querySummary = querySummary.concat(" Entity Search: ");
          querySummary = querySummary.concat(
            " Expression [" + genContent.searchText + "]"
          );
          break;

        case "relationshipSearch":
          /*
           * Format querySummary as "Relationship Search Expression [<expr>] <guid>"
           */
          querySummary = querySummary.concat(" Relationship Search: ");
          querySummary = querySummary.concat(
            " Expression [" + genContent.searchText + "]"
          );
          break;

        default:
          /*
           *  Found a gen result with no operation type.
           *  Add error message to gen so this is noticed in history....
           */
          querySummary = "Operation not recognised!";
          break;
      }

      /*
       *  Build the instances section
       */
      const instanceList = [];
      const entities = genContent.entities;
      for (let guid in entities) {
        const ent = entities[guid];
        instanceList.push({
          category: "Entity",
          label: ent.label,
          guid: ent.entityGUID,
          provenance: ent.provenance,
        });
      }

      const relationships = genContent.relationships;
      for (let guid in relationships) {
        const rel = relationships[guid];
        instanceList.push({
          category: "Relationship",
          label: rel.label,
          guid: rel.relationshipGUID,
          provenance: rel.provenance,
        });
      }
      var historyItem = {
        gen: gen,
        query: querySummary,
        instances: instanceList,
      };

      historyList.push(historyItem);
    }

    return historyList;
  }, [gens, guidToGenId]);


  const onHistoricalQueryChange  = (e) => {
    console.log("onHistoricalQueryChange" + e);
    setUseHistoricalQuery(e);
  };

  /*
   * The value we provides into the date picker is a string.
   * we get back an array where the first element should ba ea data object.
   * But we get back an invalid date object.
   */
  const onAsOfDateChange = (e) => {
    console.log(" onAsOfDateChange");
    const inputDate = e[0];
    // let validatedDate;
    if (inputDate && isValid(inputDate)) {
      setInvalidDate(false);
      setAsOfDate(inputDate);
    } else {
      setInvalidDate(true);
      setAsOfDate(undefined);
    }
  };
  const onAsOfTimeChange = (e) => {
    console.log("onTimeChange");
    const inputTime = e.target.value;

    let validatedTime;
    if (inputTime !== undefined) {
      if (inputTime) {
        validatedTime = parse(inputTime, "HH:mm", asOfDate);
        if (!validatedTime || !isValid(validatedTime)) {
          setInvalidTime(true);
          console.log("onAsOfTimeChange  setInvalidTime(true); ");
        } else {
          setInvalidTime(false);
        }
      } else {
        setInvalidTime(false);
      }
    }
    setAsOfTimeStr(inputTime);
  };

  return (
    <InstancesContext.Provider
      value={{
        gens,
        guidToGenId,
        focus,
        latestActiveGenId,
        // asOfDateStr,
        asOfTimeStr,
        asOfDateTimeForQueries,
        asOfDateTimeStr,
        invalidTime,
        invalidDate,
        isTimeDisabled,
        useHistoricalQuery,
        asOfDate,       // TODO can we remove this and key off the formatted date?
        asOfFormattedDate,   // needed for the widget 
        onHistoricalQueryChange,
        setGuidToGenId,
        setFocus,
        getFocusGUID,
        getFocusGen,
        getFocusGenId,
        setFocusEntity,
        getFocusEntity,
        changeFocusEntity,
        getFocusRelationship,
        setFocusRelationship,
        changeFocusRelationship,
        getFocusCategory,
        clearFocusInstance,
        clear,
        getHistory,
        loadEntity,
        _loadEntity,
        loadRelationship,
        _loadRelationship,
        processRetrievedTraversal,
        explore,
        _explore,
        setGens,
        getLatestActiveGenId,
        removeGen,
        getLatestGen,
        onAsOfDateChange,
        onAsOfTimeChange,
      }}
    >
      {props.children}
    </InstancesContext.Provider>
  );
};

InstancesContextProvider.propTypes = {
  children: PropTypes.node,
};

export default InstancesContextProvider;
