/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */


import React, { createContext, useState, useContext } from "react";

import PropTypes                                      from "prop-types";

import { RequestContext }                             from "./RequestContext";

import { InteractionContext }                         from "./InteractionContext";





export const ResourcesContext = createContext();

export const ResourcesContextConsumer = ResourcesContext.Consumer;


/*
 * The ResourcesContext holds the state for the resources that are retrieved from the
 * topology into the graph.
 * 
 * The ResourcesContext depends on the RequestContext for retrievals and searches.
 */


const ResourcesContextProvider = (props) => {


  const requestContext     = useContext(RequestContext);

  const interactionContext = useContext(InteractionContext);

  /*
   * The resources context remembers the platforms, servers and cohorts that the user visits.
   * When a platform name is selected the platform is loaded, which adds it to the graph.
   * If a platform's known or active servers button is clicked, the servers are retrieved from
   * the platform and added to the graph.
   */


  /*
   * The focus is the resource that is the user's current focus. It can be a platform or server. 
   * It cannot currently be a cohort or service.
   * It's guid is stored in focus.guid and its category is in focus.category.
   */

  /*
   * focus is an object containing the instanceCategory, instanceGUID and the instance itself.
   * 'category' is either server-instance or "platform"
   */
  const [focus,             setFocus]               = useState({ category  : "", guid  : ""});
  
  /*
   * This is currently being used only for server configurations - the context will retrieve
   * the stored and active (instance) configurations so they can be compared.
   * The loading property is initialized to "init" and will transition through "loading" to "loaded".
   */
  const [serverConfig,       setServerConfig]         = useState(
    { stored : null , active : null , matching : true, diffs : null, loading : "init" });
  

  /*
   * operationState reflects whether the context is waiting for a response or not.
   * It can have values 'inactive' | 'loading'
   */
  const [operationState,    setOperationState]      = useState({ state  : "inactive", name  : ""});

  /*
   * gens and guidToGenId are the array of gens and the index for rapid object retrieval from the gens.
   */
  const [gens,               setGens]               = useState([]); 
  const [guidToGenId,        setGuidToGenId]        = useState({}); 
  
  
  /*
   * availablePlatforms is a list of names of the platforms to which requests can be sent.
   * This list comes from the view-service on initialisation.
   * If the configuration of the V-S is changed, refresh the page - or we could provide a
   * list refresh capability behind a button.
   */
  const [availablePlatforms, setAvailablePlatforms]       = useState({});


  /*
   * getLatestGenId  - returns the identifier of the most recent gen 
   */
  const getLatestGenId = () => {    
    return gens.length;
  }

  /*
   * getNumGens  - returns the number of gens 
   */
  const getNumGens = () => {    
    return gens.length;
  }

  /*
   * getLatestGen  - returns the most recent gen - this may not be an active gen.
   */
  const getLatestGen = () => {   
    if (gens.length > 0) {
      return gens[gens.length-1];
    }
    else {
      return null;
    }
  }

  const getGens = () => {   
    return gens;
  }


  /*
   * Create an empty generation, including the request summary for the operation
   * responsible for the operation.
   */
  const createEmptyGen = (requestSummary) => {
    let newGen                  = {};

    newGen.requestSummary       = requestSummary;
    newGen.resources            = {};
    newGen.relationships        = {};
    return newGen;
  }

  /*
   * GUID generators
   */

  const genPlatformGUID = (platformRootName) => {
    let guid = "PLATFORM_"+platformRootName;
    return guid;
  }

  const genServerInstanceGUID = (qualifiedServerName) => {
    let guid = "SERVER_INSTANCE_"+qualifiedServerName;
    return guid;
  }

  const genPlatformServerEdgeGUID = (edgeName) => {
    let guid = "PLATFORM_TO_SERVER_"+edgeName;
    return guid;
  }

  const genServiceInstanceGUID = (serviceName) => {
    let guid = "SERVICE_INSTANCE_"+serviceName;
    return guid;
  }

  const genCohortGUID = (cohortName) => {
    let guid = "COHORT_"+cohortName;
    return guid;
  }

  const genServerCohortGUID = (serverCohortName) => {
    let guid = "SERVER_COHORT"+serverCohortName;
    return guid;
  }

  const genServerServiceGUID = (edgeName) => {
    let guid = "SERVER_SERVICE_"+edgeName;
    return guid;
  };

  const genServiceDependencyGUID = (edgeName) => {
    let guid = "SERVICE_DEPENDENCY"+edgeName;
    return guid;
  };


  /*
   * Platforms
   */
  

  /*
   * Load the platform.
   * view service url = dino/user/{userId}/platform/{platformName}
   * Behind the scenes the VS will take the configured platform resource and embellish it with live data
   * to fill in some details - e.g. it will get the origin, services, etc.
   * platform url     = {platformRootURL}/open-metadata/platform-services/users/{userId}/server-platform/origin'
   * 
   */

  const loadPlatform = (platformName) => {
    requestContext.callPOST("platform", platformName,  "platform/"+platformName, null, _loadPlatform);
  };

  const _loadPlatform = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let platformOverview = json.platformOverview;
        if (requestSummary && platformOverview) {
          processRetrievedPlatform(requestSummary, platformOverview);
          return;
        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("load platform",json);
  }

 
  /*
   * A platform query to the VS has returned a platform overview object. 
   * Add the platform to the gens if necessary.
   * platform : {
   *   displayName
   *   description
   *   platformRootURL
   *   platformOrigin
   *   accessServices, etc...
   * }
   */
  const processRetrievedPlatform = (requestSummary, platformOverview) => {

    /*
     * Perform validations on the platform object.
     *
     * Check the platform has a root URL (needed for identity)
     */
    if (!platformOverview.platformRootURL) {
      return;
    }

    /*
     * Generate the GUID for the platform and check if it's already known.
     */ 
    let guid = genPlatformGUID(platformOverview.platformName);
    
    /*
     * Add the meta fields..
     */
    platformOverview.category = "platform";
    platformOverview.guid     = guid;

    let update_objects             = {};
    update_objects.resources       = {};
    update_objects.relationships   = {};
    update_objects.resources[guid] = platformOverview;
    
    updateGens(update_objects, requestSummary);

    /*
     * Set the newly added platform to be the focus...
     */
    setFocus( { category : "platform", guid : guid } );    
    /*
     * Clear any server configuration state
     */
    setServerConfig( { stored : null, active : null , loading : "init"} );
    /*
     * Reset the operation state
     */
    setOperationState( { state : "inactive", name : "" } ); 
  }

  /*
   * update_objects is a map of resources, relationships to be located and updated or added.
   * requestSummary is the request information to associate with a new gen if one is needed
   * Note that older objects may be updated by the request and the requestSummary is unchanged as 
   * it is really to provide an audit trail of when resources and relationships were first added.
   */
  const updateGens = (update_objects, requestSummary) => {
    /*
     * Update the gens. 
     * The update process will always update an existing entry (resource or relationship) to acquire any
     * changed properties; or it will add a new gen to hold any new resources or relationships
     * Start by cloning the gens array.
     * Locate the desired entry (by GUID) in the gens clone and update or add.
     * For new entries (only) also update the guidToGenId map.
     */
    let gens_clone = Object.assign([],gens);
    let map_clone = Object.assign({},guidToGenId);
    /*
     * If a new gen is needed, add all new resources and relationships into the same new gen...
     */
    let addingGen = false;
    /*
     * These may not be used, but that's OK...
     */
    let ad_genId = getLatestGenId() + 1;
    let ad_gen = createEmptyGen(requestSummary);

    /*
     * Process resources - resourceKeys is a list of guids
     */
    let resourceKeys = Object.keys(update_objects.resources);
    resourceKeys.forEach(guid => {

      /*
       * Check whether the GUID is already known
       */
      let ex_genId = guidToGenId[guid];
      if (ex_genId !== undefined) {
        /*
         * Resource is already known
         */
      let ex_genId = guidToGenId[guid];
        console.log("resource with GUID "+guid+" already in gens");
        let ex_gen = gens_clone[ex_genId - 1];
        /*
         * Update the existing resource...
         */
        let existingResource = ex_gen.resources[guid];
        let mergedResource = Object.assign(existingResource, update_objects.resources[guid]);
        ex_gen.resources[guid] = mergedResource;
      }
      else {
        /*
         * The resource was not found in the map, so add it in a new gen.
         */
        console.log("resource with GUID "+guid+" not already in gens");

        addingGen = true;
     
        /*
         * Add the resource to the new gen.
         */
        ad_gen.resources[guid]   = update_objects.resources[guid];
        /*
         * Set the genId in the resource...
         */
        ad_gen.resources[guid].gen = ad_genId;
        /*
         * Update the guidToGenId map clone
         */
        map_clone[guid] = ad_genId;
      }
    });

    /*
     * Process relationships - relationshipKeys is a list of guids
     */
    let relationshipKeys = Object.keys(update_objects.relationships);
    relationshipKeys.forEach(guid => {
      /*
       * Check whether the GUID is already known
       */
      let ex_genId = guidToGenId[guid];
      if (ex_genId !== undefined) {
        /*
         * GUID is already known
         */
        console.log("relationship with GUID "+guid+" already in gens");
        let ex_gen = gens_clone[ex_genId - 1];
        /*
         * Update the existing relationship...
         */
         let existingRelationship = ex_gen.relationships[guid];
         let mergedRelationship = Object.assign(existingRelationship, update_objects.relationships[guid]);
         ex_gen.relationships[guid] = mergedRelationship;
      }
      else {
        /*
         * The resource was not found in the map, so add it in a new gen.
         */  
        console.log("relationship with GUID "+guid+" not already in gens");
        addingGen = true;
       
        /*
         * Add the resource to the new gen.
         */
        ad_gen.relationships[guid]   = update_objects.relationships[guid];
        /*
         * Set the genId in the resource...
         */
        ad_gen.relationships[guid].gen = ad_genId;
        /*
         * Update the guidToGenId map clone
         */
        map_clone[guid] = ad_genId;
      }
    });

    if (addingGen) {
      /*
       * There is at least one new resource or relationship.
       * Add the new gen to the gens clone
       */
      gens_clone[ad_genId -1] = ad_gen;
    }

    /*
     * Regardless of whether a new resource or relationship was added, or 
     * objects were just updated, update the real gens....
     */
    setGens(gens_clone);

    if (addingGen) {
      /*
       * Stamp the new guid map
       */
      setGuidToGenId(map_clone);
    }
  }



 
  /*
   * Get the platform that is the current focus.
   * This function verifies the expectation that there is a focus and that it is a platform
   * It also verifies that it can find a gen containing the guid of the focus platform.
   * If all of these things are true, the platform is returned.
   */
  const getFocusPlatform = () => {
    if (focus.category === "platform") {
      let guid = focus.guid;
      if (guid) {
        let genId = guidToGenId[guid];
        if (genId) {
          let gen = gens[genId-1];
          return gen.resources[guid];
        }
      }
    }
    return null;
  }


  const getActiveServers = (platformGUID) => {
    let platformName = mapPlatformGUIDToPlatformName(platformGUID);
    requestContext.callPOST("platform", platformName, "platform/"+platformName+"/servers/active", null, _getActiveServers);
  };

  const _getActiveServers = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let serverList = json.serverList;
        if (requestSummary && serverList) {
          loadServersFromPlatformQuery(requestSummary, serverList);
          return;
        }
        else {
          alert("Operation succeeded but found no active servers for platform");
          return;
        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("get active servers",json);
  }

  /*
   * Get the servers that are known on this platform
   * view service url = dino/user/{userId}/platform/{platformName}/servers/
   * platform url     = {platformRootURL}/open-metadata/platform-services/users/{userId}/server-platform/servers'
   * 
   * getKnownServers is an asynchronous function that issues the request and (in _getKnownServers) retrieves the
   * response.
   */
  const getKnownServers = (platformGUID) => {      
    let platformName = mapPlatformGUIDToPlatformName(platformGUID);
    requestContext.callPOST("platform", platformName, "platform/"+platformName+"/servers", null, _getKnownServers);

  };

  const _getKnownServers = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let serverList = json.serverList;
        if (requestSummary && serverList) {
          loadServersFromPlatformQuery(requestSummary, serverList);
          return;
        }
        else {
          alert("Operation succeeded but found no known servers for platform");
          return;
        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("get known servers",json);
  }
  

  const mapPlatformGUIDToPlatformName = (guid) => {
    let platformGenId = guidToGenId[guid];
    if (platformGenId) {
      let platformGen = gens[platformGenId-1];
      if (platformGen) {
        let platform = platformGen.resources[guid];
        if (platform) {
          let platformName = platform.platformName;
          return platformName;
        }
      }
    }
    alert("Could not map supplied platform GUID "+guid+" to a platform!");
    return null;
  }


  

  /*
   * Loading servers
   * 
   * When loading a server that is known from the configured servers in the server 
   * selector, we supply the platform name from the configuration entry.
   * The server selector can therefore call loadServer directly. This is not the 
   * case when refreshing a server that is already stored in a gen.
   *
   * When loading (refreshing) a server that is already in a gen, we need to find
   * out which platform (i.e. serverInstance) the user wants. If there is only one
   * platform associated with the server it is easy. If there are multiple platforms
   * we need to get the user to click on the corresponding link.
   */

  const loadServerFromSelector = (serverName, platformName, serverInstanceName, description) => {
    setOperationState({state:"loading", name: serverName});
    requestContext.callPOST("server-instance", serverName,  "server/"+serverName,
      { serverName         : serverName,
        platformName       : platformName,
        serverInstanceName : serverInstanceName,  // serverInstanceName is used as a correlator if set
        description        : description
      }, _loadServer);
  }


  const loadServerFromGen = (server) => {
    let platformName   = server.platformName;
    /*
     * If there is no platform indicate that no further details are avaiable (e.g. the server may have
     * been discovered through cohort membership and we do not know a platform that hosts it)
     */
    if (!platformName) {
      alert("There is no platform specified for server "+server.qualfiiedServerName+" so details cannot be retrieved.");
      return;
    }
    else {
      loadServer(server.serverInstanceName, server.serverName, platformName);
    }
  }


  const loadServer = (serverInstanceName, serverName, platformName) => {
    requestContext.callPOST("server-instance", serverName,  "server/"+serverName,
      { serverInstanceName : serverInstanceName,  // serverInstanceName is used as a correlator if set
        serverName         : serverName,
        platformName       : platformName
      }, _loadServer);
  };

  const _loadServer = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let serverOverview = json.serverOverview;
        if (requestSummary && serverOverview) {
          processRetrievedServer(requestSummary, serverOverview);
          return;
        }
      }
    }
     /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("load server",json);
  }


  /*
   * User has retrieved the active servers for the focus platform.
   * Include the servers in the gens.
   * The servers are supplied as a list of DinoServerInstance objects - each of which has the
   * -- platformName
   * -- serverName
   * -- serverInstanceName (i.e. the name configured in the VS resource endpoints)
   * -- isActive
   * This is (obviously) not the whole enchilada but at this stage these details are sufficient.
   * If the user subsequently selects one of the servers (in the server list or in the diagram)
   * that is the time to retrieve the server overview with nore information to display, similar
   * to addPlatform with the platformOverview.
   * For now we just need to stash the above details in the gen. This involves creating a vertex
   * for each server and an edge connecting it to its hosting platform.
   * Note that every server instance found in this way becomes a separate vertex - if there are
   * two or more instances of the same server (running as a cluster across multiple platforms)
   * they will not share a server entry or server vertex - they will be managed as separate
   * server instances. Each vertex is named after the (resource endpoint configuration's)
   * serverInstanceName (not the OMAG Server configuration's serverName).
   *
   * The serverList is a list of DinoServerInstance objects.
   *
   * Note that if a server instance is returned by the platform services query (performed by the
   * view service) but the view service does not have a resource endpoint for that server instance
   * then the serverInstanceName will be null. This is OK - we can still include a vertex in the
   * graph to represent the fact that the platform is running an instance of this server - but
   * we will have to invent a suitable name for the server instance.
   */
  const loadServersFromPlatformQuery = (requestSummary, serverList) => {

    /*
     * Check the list is not empty
     */
    if (!serverList) {
      return;
    }


    let update_objects           = {};
    update_objects.resources     = {};
    update_objects.relationships = {};

  
    serverList.forEach(listedServer => {


      /*
       * Validate the listed server object and initialise a serverInstance object.
       */
      let serverName             = listedServer.serverName;
      let platformName           = listedServer.platformName;

      if (!serverName || !platformName) {
        return;
      }


      let qualifiedServerName   = serverName+"@"+platformName;
    
      let isActive              = listedServer.isActive;

      /*
       * A server instance is identified by its serverInstanceGUID
       */
      let serverInstanceGUID       = genServerInstanceGUID(qualifiedServerName);

      /*
       * Build a server instance for the gen
       */
      let serverInstance                  = {};
      serverInstance.category             = "server-instance";
      serverInstance.qualifiedServerName  = qualifiedServerName;
      serverInstance.serverName           = serverName;
      serverInstance.isActive             = isActive;
      serverInstance.platformName         = platformName;
      serverInstance.guid                 = serverInstanceGUID;
      serverInstance.description          = "Loaded by "+platformName+" platform query";

      /*
       * Find out if the server instance already exists.
       * If so just ensure that the fields are up to date
       */
      let serverInstanceGenId     = guidToGenId[serverInstanceGUID];

      if (serverInstanceGenId === undefined) {
        /*
         * This is a new server instance, add it to the graph
         */
        console.log("add new server instance "+qualifiedServerName+" to graph");
      }
      else {
        /*
         * The server was already known. Check it is up to date compared
         * to the server instance fields just received from the platform.
         */
        console.log("update existing server instance "+qualifiedServerName);
      }

      update_objects.resources[serverInstanceGUID] = serverInstance;

      /*
       * Synthesize a relationship from the platform to this server instance...
       * This edge should also be 1:1 with the server instance (every server instance
       * has a platform that it calls home); so it can share the same name as the
       * server instance. Note that the category is different.
       */

      let edgeName                       = qualifiedServerName;
      let edgeGUID                       = genPlatformServerEdgeGUID(edgeName);

      let edge                           = {};
      edge.category                      = "platform-server-edge";
      edge.qualifiedServerName           = qualifiedServerName;
      edge.guid                          = edgeGUID;
      edge.serverName                    = serverName;
      edge.platformName                  = platformName;

      /*
       * Include graph navigation ids, using platformGUID to identify the source and serverInstanceGUID for target
       */
      let platformGUID                   = genPlatformGUID(platformName);
       edge.source                       = platformGUID;
       edge.target                       = serverInstanceGUID;
     
       update_objects.relationships[edgeGUID] = edge;
    });
      
    updateGens(update_objects, requestSummary);

    /*
     * Do not set the focus to any of the servers - leave it on the platform
     */

  }

  
  /*
   * Get the server that is the current focus.
   * This function verifies the expectation that there is a focus and that it is a server.
   * It also verifies that it can find a gen containing the guid of the focus server.
   * If all of these things are true, the server is returned.
   */
  const getFocusServer = () => {
    if (focus.category === "server-instance") {
      let guid = focus.guid;
      if (guid) {
        let genId = guidToGenId[guid];
        if (genId) {
          let gen = gens[genId-1];
          return gen.resources[guid];
        }
      }
    }
    return null;
  }


  /*
   * Get the service that is the current focus.
   * This function verifies the expectation that there is a focus and that it is a service.
   * It also verifies that it can find a gen containing the guid of the focus service.
   * If all of these things are true, the service is returned.
   */
  const getFocusService = () => {
    if (focus.category === "service-instance") {
      let guid = focus.guid;
      if (guid) {
        let genId = guidToGenId[guid];        if (genId) {
          let gen = gens[genId-1];
          return gen.resources[guid];
        }
      }
    }
    return null;
  }

  /*
   * Get the engine that is the current focus.
   * This function verifies the expectation that there is a focus and that it is an engine.
   * It also verifies that it can find a gen containing the guid of the focus engine.
   * If all of these things are true, the engine is returned.
   */
  const getFocusEngine = () => {
    if (focus.category === "engine-instance") {
      let guid = focus.guid;
      if (guid) {
        let genId = guidToGenId[guid];        if (genId) {
          let gen = gens[genId-1];
          return gen.resources[guid];
        }
      }
    }
    return null;
  }

  
  /*
   * Check that a resource exists that has the specified guid
   */ 
  const resourceExists = (guid) => {
    let exists = guidToGenId[guid] !== undefined;
    return exists;
  }
  
  

  /*
   * A component has requested that the focus is changed to the entity with the specified GUID.
   */
  const changeFocusResource = (guid) => {
    /*
     * If the resource is the current focus - deselect it.
     */
    if (guid === focus.instanceGUID) {
      clearFocusResource();
    }

    else {
          
      /*
       * Retrieve the new resource.....
       * Every resource has a category field.
       */
      if (guidToGenId[guid] !== undefined) {
        const genId            = guidToGenId[guid];
        const gen              = gens[genId-1];
        const resource         = gen.resources[guid];

        switch(resource.category) {

          case "platform":
            setOperationState({state:"loading", name: resource.platformName});
            loadPlatform(resource.platformName);
            break;

          case "server-instance":
            setOperationState({state:"loading", name: resource.qualifiedServerName});
            loadServerFromGen(resource);
            break;
              
          case "service-instance":
            setOperationState({state:"loading", name: resource.serviceInstanceName});
            loadServiceFromGen(resource);
            break;

          case "engine-instance":
            setOperationState({state:"loading", name: resource.engineQualifiedName});
            loadEngineFromGen(resource);
            break;

          case "cohort":
            /*
             * Not expecting a cohort to become the focus - if that changes, add code here
             */
            break;

          default:
            console.log("Unexpected resource category: "+resource.category);
            break;

        }
      }
    }
  } 


  /*
   * The resources context has been asked to load the target of a relationship....
   * This is currently only valid if the source is a platform and target is a server.
   */
  const selectTargetResource = (relationshipGUID) => {
    let relGenId        = guidToGenId[relationshipGUID];
    let relGen          = gens[relGenId - 1];
    let relationship    = relGen.relationships[relationshipGUID];
    let sourceGUID      = relationship.source;
    let targetGUID      = relationship.target;
    /*
     * Check that the source resource is a platform
     */
    let srcGenId        = guidToGenId[sourceGUID];
    let srcGen          = gens[srcGenId - 1];
    let src             = srcGen.resources[sourceGUID];
    /*
     * Check that the target resource is a server
     */
    let tgtGenId        = guidToGenId[targetGUID];
    let tgtGen          = gens[tgtGenId - 1];
    let tgt             = tgtGen.resources[targetGUID];
    if (src.category === "platform" && tgt.category === "server-instance") {
      /*
       * Retrieve the server and make it the new focus 
       */
      setOperationState({state:"loading", name: tgt.serverName});
      loadServer(tgt.qualifiedServerName, tgt.serverName, src.platformName);
    }
    else {
      /*
       * Provide an alert. This is not very nice and it would be preferable to use a 
       * cross-UI means of advising the user of an error condition. 
       * The need for this warning may be relaxed if we allow other target types to 
       * be selected by link selection.
       */
      alert("The selected link is not a platform-server link so no operation is defined");
    }
  }


  /*
   * clearFocusResource resets the category, guid for the focus resource to a state in which nothing is selected - 
   * i.e. there is no focus.
   * This operation is atomic (all aspects are updated as one state change) to avoid sequencing,
   * e.g. if the category were set first - it would trigger other components to re-render - and if 
   * the category does not match the other aspects, they will be very confused.
   */  
  const clearFocusResource = () => {
    setFocus( { category : "", guid     : ""  });
    /*
     * Ensure any server configuration state is cleared
     */
    setServerConfig( { stored : null, active : null , loading : "init"} );
  }


  /*
   * Servers
   */

  
  /*
   * processRetrievedServer needs to allow for cases when a server skeleton has been added to the graph and the user
   * then selects it - so that the full server overview is retrieved from the view service. The received  
   * server overview should augment or replace the server skeleton. This situation does not occur with 
   * platforms because the 'platform skeletons' used for selection are in the platform selector (only).
   * If servers are configured as resource endpoints (and the user selects one) there will be no 
   * server skeleton in the graph; so processRetrievedServer needs to cover a mixture of cases.
   *
   * If the server is being loaded as a result of a focus change, the server should already be known.
   * If the server is known any new information will be merged into it.
   * If the server is not known it will be added.
   */

  const processRetrievedServer = (requestSummary, serverOverview) => {

    let platformName              = requestSummary.platformName;
    let serverName                = serverOverview.serverName;

    let qualifiedServerName       = serverName +"@"+ platformName;

    let update_objects            = {};
    update_objects.resources      = {};
    update_objects.relationships  = {};
    

    /*
     * Generate the GUID for the server instance.
     */
  
    let serverInstanceGUID = genServerInstanceGUID(qualifiedServerName);

    /*
     * Create a server object - same as if the server was returned by a platform 
     * getActiveServers or getKnownServers query.
     */
    
    let serverInstance                     = {};
    serverInstance.category                = "server-instance";
    serverInstance.qualifiedServerName     = qualifiedServerName;
    serverInstance.guid                    = serverInstanceGUID;
    serverInstance.serverName              = serverName;
    serverInstance.platformName            = platformName;
    if (serverOverview.description) {
      serverInstance.description           = "Loaded by "+serverOverview.serverInstanceName+" server link. "+serverOverview.description;
    }
    else {
      serverInstance.description           = "Loaded by "+platformName+" platform query";
    }
    serverInstance.platformRootURL       = serverOverview.platformRootURL;
    serverInstance.serverOrigin          = serverOverview.serverOrigin;
    serverInstance.serverClassification  = serverOverview.serverClassification;
    serverInstance.cohortDetails         = serverOverview.cohortDetails;
    serverInstance.serverStatus          = serverOverview.serverStatus;
    serverInstance.serverServicesList    = serverOverview.serverServicesList;
    serverInstance.integrationServices   = serverOverview.integrationServices;
    serverInstance.engineServices        = serverOverview.engineServices;
    serverInstance.accessServices        = serverOverview.accessServices;
    serverInstance.viewServices          = serverOverview.viewServices;

    /*
     * Find out if the server already exists - and if so augment the platform list if the platform is not present.
     */

    update_objects.resources[serverInstanceGUID]=serverInstance;

    /*
     * The server instance may have been loaded by a platform operation or it may have been loaded
     * directly from a server link in the ServerSelector. In the latter case we do not 
     * necessarily have the server link's platform in the graph so must not attempt to 
     * create a relationship to it. If the platform is in the graph, create a relationship.
     */
    let platformGUID = genPlatformGUID(platformName);
    if (resourceExists(platformGUID)) {

      /*
       * Synthesize/update relationship from the platform to this server...
       * THe server may already have a relationship to its platform, but it could have 
       * changed state (active -> stopped or vice versa)
       */
      let edgeName                       = serverName+"@"+platformName;
      let edgeGUID                       = genPlatformServerEdgeGUID(edgeName);

      let edge                           = {};
      edge.category                      = "platform-server-edge";
      edge.edgeName                      = edgeName;
      edge.guid                          = edgeGUID;
      edge.qualifiedServerName           = qualifiedServerName;
      edge.serverName                    = serverName;
      edge.platformName                  = platformName;

      /*
       * Include graph navigation ids, using platformGUID to identify the source and serverInstanceGUID for target
       */
      edge.source                        = platformGUID;
      edge.target                        = serverInstanceGUID;
     
      update_objects.relationships[edgeGUID] = edge;

    }

    updateGens(update_objects, requestSummary);
  
    /*
     * Set the newly added server to be the focus.
     */
    setFocus({category : "server-instance", guid : serverInstanceGUID});
    setServerConfig( { stored : null, active : null , matching : true, diffs : null, loading : "init" } );
    setOperationState({state:"inactive",name:""}); 
  
  }


  /*
   * Fetch the server configuration via the VS.
   * This will retrieve both the stored and (if the server is running) active configurations
   */
  const loadServerConfiguration = () => {

    if (focus.category !== "server-instance") {
      return;
    }

    setServerConfig( { stored   : null, 
                       active   : null,
                       matching : "true" ,
                       diffs    : null,
                       loading  : "loading" } );

    let guid  = focus.guid;
    let genId = guidToGenId[guid];
    let gen   = gens[genId-1];
    if (gen) {
      let existingServer = gen.resources[guid];
      if (existingServer) {
        let serverName   = existingServer.serverName;
        let platformName = existingServer.platformName;

        /* Retrieve BOTH the stored and running instance configuration for the server */
        requestContext.callPOST("server-instance", serverName,  "server/"+serverName+"/stored-and-active-configuration",
                                        { platformName : platformName }, 
                                        _loadServerConfiguration);
      }
    }
  }

  const _loadServerConfiguration = (json) => {
  
    if (json) {
      if (json.relatedHTTPCode === 200 ) {

        /*
         * For known (stopped) servers you won't get an active config.
         */
        if (json.storedConfig  && json.activeConfig ) { 

          let differences             = {};
          let mismatchedPropertyNames = [];
          let propertyPath            = [];
          let matched                 = compareConfigurations(json.storedConfig, json.activeConfig, propertyPath, mismatchedPropertyNames);
          
          if (!matched) {
            /*
             * Add them to the differences object - which is a flat rendition of the differences
             * We could make it hierarchical to mimic the config objects but that seems a bit redundant.
             */
            mismatchedPropertyNames.forEach(propName => {
               let storedValue              = propName.split('.').reduce(index, json.storedConfig);
               let activeValue              = propName.split('.').reduce(index, json.activeConfig);
               differences[propName]        = {};
               differences[propName].active = activeValue;
               differences[propName].stored = storedValue;
            });
          }
          
          setServerConfig( { stored   : json.storedConfig, 
                             active   : json.activeConfig,
                             matching : matched ? "true" : "false",
                             diffs    : differences,
                             loading  : "loaded" } );
          return;

        }
        else if (json.storedConfig) {
          /*
           * There is only stored configuration. Nothing to compare, and no differences to report
           */
          setServerConfig( { stored   : json.storedConfig, 
                             active   : null,
                             matching : "true",
                             diffs    : null,
                             loading  : "loaded" } );
          return;

        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("load server configuration",json);
  }

  const index = (obj,i) => {return obj[i]}

  const compareConfigurations = (storedConfig, activeConfig, propertyPath, mpn) => {

    /*
     * Assume a good result, any mismatch will turn it false.
     */
    let matched = true; 


    /*
     * The comparison of configurations (stored vs active) compares every field
     * but avoids being prescriptive over the field names in the config, because 
     * this would require significant maintenance (of code) whenever the config is 
     * changed/extended. 
     * An alternative would be to add a differencing method in the config class 
     * (better for maintenance) which would be run in the VS (Java) which would
     * need to be field specific.
     * By doing this in JS then we are able to use a soft approach to extract 
     * the field names.
     *
     * It would (hypotehtically) be possible to compare just the properties that are
     * displayed (in the ServerDisplay module) and code the difference warnings there. 
     * But that would not reveal changes to areas of config that are not displayed in 
     * the subset of properties shown in the details panel, since that is a summary.
     *
     * This approach compares the properties that are physically present in
     * either or both of the active and stored configurations, which is sufficient.
     * We need to omit some (class and auditTrail at least) as these are either 
     * not relevant or do not constitute a mateiral change to the configuration
     * properties.
     */
    

    /*
     * Optionally you could also exclude "auditTrail" but only if the auditTrail 
     * display is NOT wanted in the differences display
     */
    let excludeProps = ["class"];  
   

    /*
     * Generate an aggregated (merged) set of keys - the union across both configs
     */
    let activeConfigPropNames = Object.keys(activeConfig);

    let storedConfigPropNames = Object.keys(storedConfig);

    let configPropNames = Object.assign([],activeConfigPropNames,storedConfigPropNames);

    let configPropNamesSorted = configPropNames.sort();
    configPropNamesSorted.forEach(propName => {
      /*
       * Exclude specified properties.
       */
      if (excludeProps.includes(propName)) {
        return;
      }
      let propType = typeof activeConfig[propName];
      if (propType === "object") {
        /* 
         * Dig deeper
         */
        let localPropertyPath = Object.assign([],propertyPath);
        localPropertyPath.push(propName);
        let match = compareConfigurations(storedConfig[propName], activeConfig[propName], 
          localPropertyPath, mpn);     
        if (!match) {
          matched = false;
        }
      }
      else {
        /*
         * Compare this property value
         */
        let match = storedConfig[propName] === activeConfig[propName];
        if (!match) {
          let localPropertyPath = Object.assign([],propertyPath);
          localPropertyPath.push(propName);
          let propertyLocator = flattenPropertyPath(localPropertyPath);
          mpn.push(propertyLocator);
          matched = false;
        }
       
      }

    })
    return matched;
  }



  const flattenPropertyPath = (propPath) => {
    if (propPath && propPath.length > 0) {
      let flatPath = propPath[0];
      for (let i=1; i<propPath.length; i++) {
        flatPath = flatPath.concat("."+propPath[i]);
      }
      return flatPath;
    }
    return null;
  }





  /*
   * Load a cohort purely from configuration (as opposed to loading it from a server's details)
   */
  const loadConfiguredCohort = (serverName, cohortName) => {

    loadCohort(serverName, cohortName, true);

  }

  /*
   * This function will load the specified cohort from the specified server's serverDetails
   */
  const loadCohortFromServer = (serverName, cohortName) => {

    loadCohort(serverName, cohortName, false);

  }

  /*
   * Load a cohort either from configuration (third parameter true) or from a server's details.
   *
   * The cohort is added into a gen so the cohort exists in its own right. It also creates an 
   * edge from the specified server to the chort. This does not need to retrieve the cohort from the VS
   * because we should already have enough cohort details.
   */
  const loadCohort = (serverName, cohortName, configured) => {


    /*
     * Find the server entry in the gens. If the server is not found the operation will fail.
     */
    let serverInstanceGUID = genServerInstanceGUID(serverName);

    let serverGenId = guidToGenId[serverInstanceGUID];
    if (serverGenId === undefined) {
      /*
       * Operation cannot proceed - we do not have the specified server.
       */
      alert("Cannot add cohort for unknown server "+serverName);
      return;
    }

  
    /*
     * Create a cohort object
     */
    let cohortGUID = genCohortGUID(cohortName);
  
    let cohort                   = {};
    cohort.category              = "cohort";
    cohort.cohortName            = cohortName;    
    cohort.guid                  = cohortGUID;
  

    /*
     * Create a relationship from the specified server to the cohort - if we do not already have one
     * The relationship will need a guid, a source and target and a gen (which is assigned when the 
     * gen is created)
     */

    let serverCohortName                          = serverName+"@"+cohortName;
    let serverCohortGUID                          = genServerCohortGUID(serverCohortName);

    let serverCohortRelationship                  = {};
    serverCohortRelationship.category             = "server-cohort";
    serverCohortRelationship.serverCohortName     = serverCohortName;
    serverCohortRelationship.guid                 = serverCohortGUID;
    serverCohortRelationship.serverName           = serverName;
    serverCohortRelationship.cohortName           = cohortName;


    /*
     * In both the configured and non-configured cases, indicate whether the server is 
     * actively participating in the cohort.
     * This can be determined by retrieving the server from the gens, look in the serverDetails 
     * and retrieve the cohortDetails to get the connection status.
     */
    let serverGen                                  = gens[serverGenId - 1];
    let server                                     = serverGen.resources[serverInstanceGUID];
    let cohortDetails                              = server.cohortDetails[cohortName];
    let connectionDescription                      = cohortDetails.cohortDescription;
    let connectionStatus                           = connectionDescription.connectionStatus;
    let isActive                                   = connectionStatus === "CONNECTED";
    serverCohortRelationship.active                = isActive;

  
    /*
     * Include graph navigation ids.
     */
    serverCohortRelationship.source                = serverInstanceGUID;
    serverCohortRelationship.target                = cohortGUID;
  
  
    /*
     * Create a map of the objects to be updated.
     */
    let update_objects                              = {};
    update_objects.resources                        = {};
    update_objects.relationships                    = {};
    update_objects.resources[cohortGUID]            = cohort;
    update_objects.relationships[serverCohortGUID]  = serverCohortRelationship; 

    /*
     * Include a request summary - since this was a local operation there is no request information 
     * to be returned from the VS
     */
    let requestSummary             = {};
    requestSummary.serverName      = serverName;
    requestSummary.platformName    = null;
    if (configured)
      requestSummary.operation     = "Expansion of server configuration for cohort "+cohortName;
    else
      requestSummary.operation     = "Expansion of cohort "+cohortName;
    
    
    /*
     * Update the gens
     */
    updateGens(update_objects, requestSummary);
    
    /*
     * Although we're adding a cohort, leave the focus as it was... so there is no need
     * to setFocus (since there is no change) nor to setOperationState (since there was no
     * remote operation)
     */
  };



  /*
   * This function reloads a service that is already in a gen.
   * This is used when a user clicks on a service icon to give it the focus.
   * As such we want to load it (from the view service) and then make it the focus.
   */
  const loadServiceFromGen = (serviceInstance) => {

    /*
     * The serviceName field in a RegisteredOMAGService is set by admin services to the service full name
     */
    let serviceCat = serviceInstance.serviceCat;
    let serviceFullName;
    switch (serviceCat) {

      case "IntegrationService":
        serviceFullName    = serviceInstance.serviceConfig.integrationServiceFullName;
        break;

      case "EngineService":
        serviceFullName    = serviceInstance.serviceConfig.engineServiceFullName;
        break;

      case "AccessService":
        /*
         * Need to be slightly guarded with an access service. It could have been loaded
         * from a partnerOMAS link and hence will not necessarily have any config (that
         * is only present when Dino has retrieved the service configuration from the
         * server running the service). So, if there is no config, use the serviceName
         * field instead - in loadPartnerOMAS it will have been initialised with the
         * full service name derived from the configuration of the service to whom it is
         * a partner (e.g. an integration service's configuration).
         */
        if (serviceInstance.serviceConfig) {
          serviceFullName    = serviceInstance.serviceConfig.accessServiceFullName;
        }
        else {
          serviceFullName    = serviceInstance.serviceName;
        }
        break;

      case "ViewService":
        serviceFullName    = serviceInstance.serviceConfig.viewServiceFullName;
        break;

      default:
        alert("Dino ResourcesContext loadServiceFromGen was passed an unknown service category of "+serviceCat);
        return;

    }

    let platformName = serviceInstance.platformName;
    let serverName = serviceInstance.serverName;

    console.log("loadServiceFromGen - will try to load serviceInstance "+serviceFullName);

    loadService(serviceCat, platformName, serverName, serviceFullName, true);  // make the loaded service the new focus
  };


  const findServiceInList = (serviceList, serviceFullName) => {
    for (let i=0; i<serviceList.length; i++) {
      let svc = serviceList[i];
      /*
       * A listed RegisteredOMAGService has serviceName field set to the full name of the service.
       */
      if (svc.serviceName === serviceFullName) {
        /* This is the one */
        return svc.serviceURLMarker;
      }
    }
    return null;
  };

  /*
   * Use the qualifiedServerName to identify and locate the server as it will not always be the focus resource.
   * Use the qualifiedServerName to locate the server instance and then from the serverInstance retrieve
   * the serverName and platformName. The serverInstance also has the list(s) of services running on the serverInstance.
   * By locating the service requested in the serviceFullName parameter, it is possible to find
   * the other service details like the service-url-marker.
   *
   * A (partner) access service may have been loaded before the server that is running it. The function therefore
   * checks for existence of the server (in the graph) and behaves accordingly.
   *
   * Parameters:
   * serviceCat         - { "IntegrationService" | "AccessService" | ... } tells context what type of service to expect
   * platformName       - The name of the platform running the server that is running the service
   * serverName         - The name of the server that is running the service
   * serviceFullName    - The FULL name of the service. This is the name returned in a RegisteredOMAGService object
   * makeFocus          - Whether to make the loaded service the new focus on completion.
   */
  const loadService = (serviceCat, platformName, serverName, serviceFullName, makeFocus) => {

    let qualifiedServerName = serverName +"@"+ platformName;
    let serverInstanceGUID = genServerInstanceGUID(qualifiedServerName);
    let serverInstanceGenId = guidToGenId[serverInstanceGUID];


    let serviceURLMarker = null;
    let viewServiceURL   = null;

    if (!serverInstanceGenId) {

     /*
      * Server not yet loaded; it could not be found in gens
      */

      /*
       * We do not have access to the serviceURLMarker. For an access service it is optional (in the
       * view service's method for retrieval of access-service-details).
       */
      serviceURLMarker = "Unknown for parnerOMAS";
      viewServiceURL = "access-service-details";

    }
    else {

      /*
       * Server already loaded and found in gens
       */

      let serverInstanceGen = gens[serverInstanceGenId-1];
      let serverInstance = serverInstanceGen.resources[serverInstanceGUID];
      serverName   = serverInstance.serverName;
      platformName = serverInstance.platformName;

      /*
       * Look for the service by full name in the services listed for the serviceCat. We are looking
       * for a service that has a matching url-marker because that is what the view service needs.
       * It would be possible to relax this; for an access service the VS can use serviceFullName
       * but this is not currently common across the other service categories. It could be - it is just
       * a matter of adding it to those categories in the view service.
       */

      switch (serviceCat) {

        case "IntegrationService":
          serviceURLMarker = findServiceInList(serverInstance.integrationServices, serviceFullName);
          viewServiceURL = "integration-service-details";
          break;

        case "EngineService":
          serviceURLMarker = findServiceInList(serverInstance.engineServices, serviceFullName);
          viewServiceURL = "engine-service-details";
          break;

        case "AccessService":
          if (serverInstance.accessServices) {
            serviceURLMarker = findServiceInList(serverInstance.accessServices, serviceFullName);
          }
          else {
            serviceURLMarker = "Unknown for server only represented by a server overview";
          }
          viewServiceURL = "access-service-details";
          break;

        case "ViewService":
          serviceURLMarker = findServiceInList(serverInstance.viewServices, serviceFullName);
          viewServiceURL = "view-service-details";
          break;

        default:
          console.log("loadService: passed unknown serviceCat of "+serviceCat);
          return;
      }

      if (serviceURLMarker === null) {
        /* Did not find service... bin out */
        alert("Dino loadService could not find service "+serviceFullName);
        return;
      }
    }

    let callback;
    if (makeFocus)
      callback =  _loadServiceAndFocus;
    else
      callback = _loadService;

    /* Retrieve the configuration for the service */
    requestContext.callPOST("service-instance", serviceFullName,  "server/"+serverName+"/"+viewServiceURL,
      { serverName          : serverName,
        platformName        : platformName,
        serviceFullName     : serviceFullName,
        serviceURLMarker    : serviceURLMarker
      },
      callback);

  };

  const _loadService = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let serviceDetails = json.serviceDetails;
        if (requestSummary && serviceDetails) {
          processRetrievedServiceDetails(requestSummary, serviceDetails, false);
          return;
        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("load server",json);
  };

  const _loadServiceAndFocus = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let serviceDetails = json.serviceDetails;
        if (requestSummary && serviceDetails) {
          processRetrievedServiceDetails(requestSummary, serviceDetails, true);
          return;
        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("load server",json);
  };



  const processRetrievedServiceDetails = (requestSummary, serviceDetails, makeFocus) => {

    // Use the discriminator (serviceCat) to determine the category of the ServiceDetails object.

    let serviceCat = serviceDetails.serviceCat;

    let serviceConfig;
    let serviceName;

    switch (serviceCat) {
      case "IntegrationService":
        serviceConfig = serviceDetails.integrationServiceConfig;
        serviceName   = serviceConfig.integrationServiceFullName;
        break;

      case "EngineService":
        serviceConfig = serviceDetails.engineServiceConfig;
        serviceName   = serviceConfig.engineServiceFullName;
        break;

      case "AccessService":
        serviceConfig = serviceDetails.accessServiceConfig;
        serviceName   = serviceConfig.accessServiceFullName;
        break;

      case "ViewService":
        serviceConfig = serviceDetails.viewServiceConfig;
        serviceName   = serviceConfig.viewServiceFullName;
        break;

      default:
        alert("Dino ResourcesContext processRetrievedServiceDetails was passed a service with an unknown service category of "+serviceCat);
        return;
    }


    /*
     * Create a service object.
     * Need to uniquely identify this instance of the service so concatenate
     * the service name and server instance name.
     */
    let qualifiedServerName = requestSummary.serverName +"@"+ requestSummary.platformName;
    let serverInstanceGUID  = genServerInstanceGUID(qualifiedServerName);

    let serviceInstanceName = serviceName +"@"+ qualifiedServerName;
    let serviceInstanceGUID = genServiceInstanceGUID(serviceInstanceName);

    let serviceInstance                   = {};
    serviceInstance.guid                  = serviceInstanceGUID;
    serviceInstance.category              = "service-instance";
    serviceInstance.serviceName           = serviceName;
    serviceInstance.serviceConfig         = serviceConfig;
    serviceInstance.serviceCat            = serviceCat;

    serviceInstance.serverName            = requestSummary.serverName;
    serviceInstance.platformName          = requestSummary.platformName;


    /*
     * Create a map of the objects to be updated.
     */
    let update_objects                               = {};
    update_objects.resources                         = {};
    update_objects.relationships                     = {};
    update_objects.resources[serviceInstanceGUID]    = serviceInstance;


    /*
     * If (and only if) the server hosting the service is already in the gens, create am edge from it
     * to the service.
     * If the service is a (partner) OMAS then the server may not have been loaded. If it has, create
     * an edge, but if it hasn't just leave the OMAS not connected to a hosting server.
     *
     * Create a relationship from the specified server to the service.  - if we do not already have one
     * The relationship will need a guid, a source and target and a gen (which is assigned when the
     * gen is created)
     */

    /*
     * Look for the server...
     */

    let serverInstanceGenId = guidToGenId[serverInstanceGUID];
    if (serverInstanceGenId) {

      /*
       * Synthesize a relationship from the server instance to this service instance...
       * This edge should always be 1:1 with the service instance (every service instance
       * has a server instance that it calls home); so it can share the same name as the
       * service instance. Note that the category is different.
       */

      let edgeName             = serviceInstanceName;
      let edgeGUID             = genServerServiceGUID(edgeName); // "SERVER_SERVICE_"+edgeName;

      let edge                 = {};
      edge.category            = "server-service-edge";
      edge.serverCohortName    = edgeName;
      edge.guid                = edgeGUID;
      edge.qualifiedServerName = qualifiedServerName;
      edge.serviceInstanceName = serviceInstanceName;

      /*
       * Server-Service relationships are always active - this is driven from the active server list.
       */

      /*
       * Include graph navigation ids.
       */
      edge.source              = serverInstanceGUID;
      edge.target              = serviceInstanceGUID;

      update_objects.relationships[edgeGUID] = edge;
    }

    updateGens(update_objects, requestSummary);

    /*
     * Only make the service the focus if the caller requested that.
     * Focus is applied when the user has clicked on a node in the diagram; it is not applied
     * when a service list entry is merely expanded.
     */
    if (makeFocus) {
      setFocus( { category : "service-instance", guid : serviceInstanceGUID } );
    }

    /*
     * Indicate that the load operation is complete
     */
    setOperationState( { state:"inactive", name:""} );

  }


  /*
   * This function will load the integration services by asking the VS to retrieve them.
   *
   */
  const loadIntegrationServices = (serverName) => {

    /*
     * If the server is not found the operation will fail.
     */
    let serverInstanceGUID = genServerInstanceGUID(serverName);

    /*
     * Find the server entry in the gens
     */
    let serverGenId = guidToGenId[serverInstanceGUID];
    if (serverGenId === undefined) {
      /*
       * Operation cannot proceed - we do not have the specified server.
       */
      alert("Cannot add service for unknown server "+serverName);
      return;
    }

    /*
     * Check that the server is the focus resource
     */
    if (focus.category !== "server-instance") {
      return;
    }

    let guid  = focus.guid;
    let genId = guidToGenId[guid];
    let gen   = gens[genId-1];
    if (gen) {
      let existingServer = gen.resources[guid];
      if (existingServer) {
        let serverName   = existingServer.serverName;
        let platformName = existingServer.platformName;

        /* Retrieve a list of the integration services configured on the server */
        requestContext.callPOST("server-instance", serverName,  "server/"+serverName+"/integration-services",
                                        { platformName : platformName  },
                                        _loadIntegrationServices);
      }
    }
  }

  const _loadIntegrationServices = (json) => {

    if (json) {
      if (json.relatedHTTPCode === 200 ) {

        /*
         * For known (stopped) servers you won't get an active config.
         */
        if (json.serviceList) {

          let requestSummary = json.requestSummary;
          let serverName = requestSummary.serverName;
          let platformName = requestSummary.platformName;
          processRetrievedIntegrationServiceList(platformName, serverName, json.serviceList);

          return;

        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("list integration services",json);
  }


  const processRetrievedIntegrationServiceList = (platformName, serverName, serviceList) => {

    if (serviceList)
    {
      /*
       * Create a map of service objects and their server-service relationships
       */
      let update_objects                               = {};
      update_objects.resources                         = {};
      update_objects.relationships                     = {};

      /*
       * Iterate over the list and construct an update map
       */
      serviceList.forEach( svc => {

        let serviceName = svc.serviceName;
        let serviceGUID = genServiceInstanceGUID(serviceName);

        /*
         * Create service object
         */
        let service                   = {};
        service.category              = "service-instance";
        service.serviceName           = serviceName;
        service.guid                  = serviceGUID;

        /*
         * Create a relationship from the specified server to the cohort - if we do not already have one
         * The relationship will need a guid, a source and target and a gen (which is assigned when the
         * gen is created)
         */

        let serverServiceName                         = serviceName+"@"+serverName;
        let serverServiceGUID                         = "SERVER_SERVICE"+serverServiceName;

        let serverServiceRelationship                 = {};
        serverServiceRelationship.category            = "server-service";
        serverServiceRelationship.serverCohortName    = serverServiceName;
        serverServiceRelationship.guid                = serverServiceGUID;
        serverServiceRelationship.serverName          = serverName;
        serverServiceRelationship.cohortName          = serviceName;
        /*
         * Server-Service relationships are always active - this is driven from the active server list.
         */
        serverServiceRelationship.active              = true;

        /*
         * Include graph navigation ids.
         */
        let serverInstanceGUID                        = genServerInstanceGUID(serverName);
        serverServiceRelationship.source              = serverInstanceGUID;
        serverServiceRelationship.target              = serviceGUID;

        /*
         * Add to update map
         */
        update_objects.resources[serviceGUID]            = service;
        update_objects.relationships[serverServiceGUID]  = serverServiceRelationship;

      });

      /*
       * Include a request summary - since this was a local operation there is no request information
       * to be returned from the VS
       */
      let requestSummary             = {};
      requestSummary.serverName      = serverName;
      requestSummary.operation       = "List integration services";
      requestSummary.platformName    = null;

      updateGens(update_objects, requestSummary);

    }
  }

  /*
   * This function will load the engine services by asking the VS to retrieve them.
   *
   */
  const loadEngineServices = (serverName) => {

    /*
     * If the server is not found the operation will fail.
     */
    let serverInstanceGUID = genServerInstanceGUID(serverName);

    /*
     * Find the server entry in the gens
     */
    let serverGenId = guidToGenId[serverInstanceGUID];
    if (serverGenId === undefined) {
      /*
       * Operation cannot proceed - we do not have the specified server.
       */
      alert("Cannot add service for unknown server "+serverName);
      return;
    }

    /*
     * Check that the server is the focus resource
     */
    if (focus.category !== "server-instance") {
      return;
    }

    let guid  = focus.guid;
    let genId = guidToGenId[guid];
    let gen   = gens[genId-1];
    if (gen) {
      let existingServer = gen.resources[guid];
      if (existingServer) {
        let serverName   = existingServer.serverName;
        let platformName = existingServer.platformName;

        /* Retrieve a list of the engine services configured on the server */
        requestContext.callPOST("server-instance", serverName,  "server/"+serverName+"/engine-services",
                                        { platformName : platformName  },
                                        _loadEngineServices);
      }
    }
  }

  const _loadEngineServices = (json) => {

    if (json) {
      if (json.relatedHTTPCode === 200 ) {

        /*
         * For known (stopped) servers you won't get an active config.
         */
        if (json.serviceList) {

          let requestSummary = json.requestSummary;
          let serverName = requestSummary.serverName;
          let platformName = requestSummary.platformName;
          processRetrievedEngineServiceList(platformName, serverName, json.serviceList);

          return;

        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("list engine services",json);
  }


  const processRetrievedEngineServiceList = (platformName, serverName, serviceList) => {

    if (serviceList)
    {
      /*
       * Create a map of service objects and their server-service relationships
       */
      let update_objects                               = {};
      update_objects.resources                         = {};
      update_objects.relationships                     = {};

      /*
       * Iterate over the list and construct an update map
       */
      serviceList.forEach( svc => {

        let serviceName = svc.serviceName;
        let serviceGUID = genServiceInstanceGUID(serviceName);

        /*
         * Create service object
         */
        let service                   = {};
        service.category              = "service-instance";
        service.serviceName           = serviceName;
        service.guid                  = serviceGUID;

        /*
         * Create a relationship from the specified server to the cohort - if we do not already have one
         * The relationship will need a guid, a source and target and a gen (which is assigned when the
         * gen is created)
         */

        let serverServiceName                         = serviceName+"@"+serverName;
        let serverServiceGUID                         = "SERVER_SERVICE"+serverServiceName;

        let serverServiceRelationship                 = {};
        serverServiceRelationship.category            = "server-service";
        serverServiceRelationship.serverCohortName    = serverServiceName;
        serverServiceRelationship.guid                = serverServiceGUID;
        serverServiceRelationship.serverName          = serverName;
        serverServiceRelationship.cohortName          = serviceName;
        /*
         * Server-Service relationships are always active - this is driven from the active server list.
         */
        serverServiceRelationship.active              = true;

        /*
         * Include graph navigation ids.
         */
        let serverInstanceGUID                        = genServerInstanceGUID(serverName);
        serverServiceRelationship.source              = serverInstanceGUID;
        serverServiceRelationship.target              = serviceGUID;

        /*
         * Add to update map
         */
        update_objects.resources[serviceGUID]            = service;
        update_objects.relationships[serverServiceGUID]  = serverServiceRelationship;

      });

      /*
       * Include a request summary - since this was a local operation there is no request information
       * to be returned from the VS
       */
      let requestSummary             = {};
      requestSummary.serverName      = serverName;
      requestSummary.operation       = "List engine services";
      requestSummary.platformName    = null;

      updateGens(update_objects, requestSummary);

    }
  }



  /*
   * Create an object to represent a partner OMAS and load it into the gens.
   *
   * The partner OMAS is a service object that is added into a gen so the service instance exists in
   * the graph. It also creates an edge from the service that depends on the partnerOMAS to the partnerOMAS.
   * This does not need to retrieve the service instance from the view-service, as the partnerOMAS is really
   * a logical object, which may be resolved physically later.
   *
   * The first parameter (serviceInstance) is the service that depends on the partner OMAS. This is only needed
   * so this function can create an edge from it to the partner OMAS service.
   *
   * The serviceCat parameter indicates whether the soure service is an integration or engine service.
   *
   * If the partnerOMAS already exists but there is no edge from the dependent service then a edge will be
   * created. If both the partnerOMAS and edge already exist then nothing new is added to the graph.
   */
  const loadPartnerOMAS = (sourceServiceInstanceGUID, serviceCat) => {

    let sourceServiceInstanceGenId = guidToGenId[sourceServiceInstanceGUID];
    let sourceServiceInstanceGen = gens[sourceServiceInstanceGenId - 1];
    let sourceServiceInstance = sourceServiceInstanceGen.resources[sourceServiceInstanceGUID];
    let sourceServiceInstanceName = sourceServiceInstance.serviceName;
    let sourceServiceConfig = sourceServiceInstance.serviceConfig;
    let partnerOMASName;
    if (serviceCat === "IntegrationService") {
      // The integrationServicePartnerOMAS field contains the full name of the partner service.
      partnerOMASName = sourceServiceConfig.integrationServicePartnerOMAS;
    }
    else {
      // assumed to be an engine service
      // The engineServicePartnerOMAS field contains the full name of the partner service.
      partnerOMASName = sourceServiceConfig.engineServicePartnerOMAS;
    }
    let partnerOMASServerName = sourceServiceConfig.omagserverName;
    let partnerOMASServerRootURL = sourceServiceConfig.omagserverPlatformRootURL;

    /*
     * Create a partnerOMAS (service-instance) object.
     * Resolve the partnerOMASServerRootURL to a platformName is possible. If this is not
     * possible then it's OK - it will mean that the user has reached the limit of where
     * they are allowed to explore. If possible advise them that this is the case.
     *
     * If it is possible to correlate to a platformName then it should be included in the serviceInstanceName
     * (as part of the qualifiedServerName) so that this service (which was reached by dependency traversal)
     * has the same identity information as a service instance that was reached by expansion (from a server
     * instance). The latter is given the qualifiedServerName as part of its serviceInstanceName.
     */

    let correlatedPlatformName = null;
    let qualifiedServerName = null;
    let serviceInstanceName;

    let platformNames = Object.keys(availablePlatforms);
    for (let i=0; i<platformNames.length; i++) {
      let platformName = platformNames[i];
      let platform = availablePlatforms[platformName];
      if (platform.platformRootURL === partnerOMASServerRootURL) {
        console.log("Found the partner's platformURL of "+partnerOMASServerRootURL+" in availablePlatforms");
        correlatedPlatformName      = platformName;
        qualifiedServerName         = partnerOMASServerName +"@"+ correlatedPlatformName;
        serviceInstanceName         = partnerOMASName +"@"+ qualifiedServerName;
        break;
      }
    }
    if (correlatedPlatformName === null) {
      /*
       * The platform/server root URL could not be correlated with an available platform
       */
      console.log("Did not find the partner's platformURL of "+partnerOMASServerRootURL+" in availablePlatforms");
      /*
       * Provide an indication to the user that this is the edge of the user's known universe
       */
      alert("Advisory: It will not be possible to navigate beyond the "+partnerOMASName+" partner OMAS without a configured resource endpoint for the platform running it");
      serviceInstanceName = partnerOMASName +"@"+ partnerOMASServerName;
    }

    let serviceInstanceGUID = genServiceInstanceGUID(serviceInstanceName);

    let serviceInstance                         = {};
    serviceInstance.guid                        = serviceInstanceGUID;
    serviceInstance.serviceCat                  = "AccessService";
    serviceInstance.category                    = "service-instance";
    serviceInstance.serverName                  = partnerOMASServerName;
    serviceInstance.platformName                = correlatedPlatformName;  // If null then only have partnerOMASServerRootURL
    serviceInstance.partnerOMASServerRootURL    = partnerOMASServerRootURL;
    serviceInstance.serviceName                 = partnerOMASName;         // This is the full name of the service.
    serviceInstance.qualifiedServerName         = qualifiedServerName
    /*
     * Do not set more fields than needed - e.g. do not set the serviceConfig to null - it may already be present
     * in the access service (if in the graph) and should not be removed during the merge that occurs when this
     * service instance object is merged into the instance already in the gens.
     */

    /*
     * Create a service-dependency relationship from the specified service to the partner service, if we do not
     * already have one.
     * The relationship will need a guid, a source and target and a gen (which is assigned when the
     * gen is created)
     *
     * Synthesize a relationship from the source server instance to the partner service instance.
     * This edge should always be 1:1 with the source service (because the partner service
     * could serve multiple source services, but the source service only has one partner).
     * The edge can therefore adopt the name of the source service.
     * Note that the category is set to "service-dependency-edge".
     */
    let edgeName             = sourceServiceInstanceName;
    let edgeGUID             = genServiceDependencyGUID(edgeName);
    let edge                 = {};
    edge.category            = "service-dependency-edge";
    edge.guid                = edgeGUID;
    edge.serviceInstanceName = sourceServiceInstanceName;


    /*
     * Include graph navigation ids.
     */
    edge.source              = sourceServiceInstanceGUID;
    edge.target              = serviceInstanceGUID;

    /*
     * Create a map of the objects to be updated.
     */
    let update_objects                               = {};
    update_objects.resources                         = {};
    update_objects.relationships                     = {};
    update_objects.resources[serviceInstanceGUID]    = serviceInstance;
    update_objects.relationships[edgeGUID]           = edge;

    /*
     * Include a request summary - since this was a local operation there is no request information
     * to be returned from the VS
     */
    let requestSummary        = {};
    requestSummary.operation  = "Expansion of partner OMAS dependency for service "+sourceServiceInstance.serviceInstanceName;

    /*
     * Update the gens
     */
    updateGens(update_objects, requestSummary);

    /*
     * Although we're adding a service instance , leave the focus as it was... so there is no need
     * to setFocus (since there is no change) nor to setOperationState (since there was no
     * remote operation)
     */
  };




  /*
   * Clear the state of the session - this includes the gens, the focus and the guidToGenId map.
   */
  const clear = () => {   

    /*
     * Reset the focus
     */
    clearFocusResource();
    
    /*
     * Empty the graph
     */
    const emptyArray = [];
    setGens(emptyArray);

    /*
     * Empty the map
     */
    const emptymap = {};
    setGuidToGenId(emptymap);
    
  }


  /*
   * Remove a generation from the graph
   */
  const removeGen = () => {
    /*
     * Remove the most recent gen from the active gens. This should be noticed by the DiagramManager
     * which will update the diagram data, and callback to the removeGenComplete callback.
     * 
     * If the focus resource is in the gen being removed then clear the focus.
     */    
    
 
    /*
     * Do not mutate the current array - replace for state update to register
     */
    let newList = Object.assign([],gens);
    const removedGen = newList.pop();
    if (removedGen.resources[focus.guid] !== undefined) {
      /*
       * Clear the focus
       */
      setFocus({ category  : "", guid  : "" } );
      /*
       * Clear any server configuration state
       */
      setServerConfig( { stored : null, active : null , loading : "init"} );
      /*
       * Reset any operation state
       */
      setOperationState( { state : "inactive", name : "" } ); 
    }
    setGens( newList );

    /*
     * Look for resources that were added in the removedGen, and remove them from the guidToGenId map.
     * Because the map is immutable, corral the changes in a cloned map and apply them in one replace operation
     */
    
    let newGUIDMap = Object.assign({},guidToGenId);
    const eKeys = Object.keys(removedGen.resources);
    eKeys.forEach(r => {
      delete newGUIDMap[r];
    });
    const rKeys = Object.keys(removedGen.relationships);
    rKeys.forEach(r => {
      delete newGUIDMap[r];
    });
    /*
     * Now replace the map...
     */
    setGuidToGenId(newGUIDMap);

  }

  
  /*
   * This function reloads an engine that is already in a gen.
   * This is used when a user clicks on an engine icon to give it the focus.
   * As such we want to load it (from the view service) and then make it the focus.
   */
  const loadEngineFromGen = (engine) => {

    /*
     * The GUID of the OMES service instance that is running this engine was stashed
     * when the engine was loaded.
     */
    let omesServiceInstanceGUID = engine.omesServiceInstanceGUID;

    console.log("loadEngineFromGen - will try to load engine "+engine.engineQualifiedName);

    loadEngine(omesServiceInstanceGUID, engine.engineQualifiedName, true);  // make the loaded engine the new focus
  };



  /*
   * loadEngine will load the details of an engine and add it to the graph.
   * The OMES that is running the engine will already have been loaded and its GUID is passed in.
   * The engines will have been listed in summary form and the user has selected one. Based on its
   * engineQualifiedName, retrieve the engine's configuration and list the services that are registered
   * to the engine.
   *
   * Parameters:
   * omesServiceInstanceGUID   - GUID of the OMES running the engine
   * engineQualifiedName       - The name of the engine to load.
   *
   * For now, do not make the loaded engine the focus.
   *
   */
  const loadEngine = (omesServiceInstanceGUID, engineName, makeFocus) => {


    let omesInstanceGenId = guidToGenId[omesServiceInstanceGUID];


    let viewServiceURL   = null;
    let serverName       = null;

    if (!omesInstanceGenId) {

      alert("loadEngine could not find the OpenMetadataEngineService in the gens!");
      return;

    }
    else {

      /*
       * OMES found in gens
       */

      let omesInstanceGen = gens[omesInstanceGenId-1];
      let omesInstance    = omesInstanceGen.resources[omesServiceInstanceGUID];

      /*
       * This request has to be routed to the partner OMAS for the engine service
       * since that is where the OMES confgiuration is managed.
       */
      serverName            = omesInstance.serviceConfig.omagserverName;
      let platformRootURL   = omesInstance.serviceConfig.omagserverPlatformRootURL;
      // Needs to be correlated to an available platform...
      let correlatedPlatformName = null;

      let platformNames = Object.keys(availablePlatforms);
      for (let i=0; i<platformNames.length; i++) {
        let platformName = platformNames[i];
        let platform = availablePlatforms[platformName];
        if (platform.platformRootURL === platformRootURL) {
          console.log("Found the partner's platformURL "+platformRootURL+" in availablePlatforms");
          correlatedPlatformName      = platformName;
          break;
        }
      }
      if (correlatedPlatformName === null) {
        /*
         * The platform/server root URL could not be correlated with an available platform
         */
        console.log("Did not find the partner's platformURL of "+platformRootURL+" in availablePlatforms");
        /*
         * Provide an indication to the user that this is the edge of the user's known universe
         */
        alert("Advisory: It will not be possible to navigate to the engine without a configured resource endpoint for the platform running the partnerOMAS");
      }

      viewServiceURL = "engine-details";

      let callback;
      if (makeFocus)
        callback =  _loadEngineAndFocus;
      else
        callback = _loadEngine;

      /* Retrieve the engine details */
      requestContext.callPOST("engine-instance", engineName,  "server/"+serverName+"/"+viewServiceURL,
        { serverName               : serverName,
          platformName             : correlatedPlatformName,
          requestContextCorrelator : omesServiceInstanceGUID,
          engineQualifiedName      : engineName
        },
        callback);

    }
  };

  /*
   * Callback to be used when loading an engine and not wanting it to become the focus
   */
  const _loadEngine = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let engineDetails = json.engineDetails;
        if (requestSummary && engineDetails) {
          processRetrievedEngineDetails(requestSummary, engineDetails, false);
          return;
        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("load engine",json);
  };

  /*
   * Callback to be used when loading an engine and wanting it to become the focus
   */
  const _loadEngineAndFocus = (json) => {
    if (json) {
      if (json.relatedHTTPCode === 200 ) {
        let requestSummary = json.requestSummary;
        let engineDetails = json.engineDetails;
        if (requestSummary && engineDetails) {
          processRetrievedEngineDetails(requestSummary, engineDetails, true);
          return;
        }
      }
    }
    /*
     * On failure ...
     */
    interactionContext.reportFailedOperation("load engine",json);
  };



  /*
   * Function to parse retrieved engine object and add it to the graph
   */
  const processRetrievedEngineDetails = (requestSummary, engineDetails, makeFocus) => {

    /*
     * Create an engine object.
     * Need a unique ID for this engine. You could form this from the engine's
     * qualified name together with the OMES service instance instance name (which in turn
     * includes the qualifiedServerName, so the derived name should be unique even when a
     * service is running across a server that is cluster deployed). However, now that
     * we are dealing with an object (the engine) that is stored in a repository, we have a
     * ready made Egeria instance GUID that is equally appropriate; we just need to make
     * sure we carry the GUID with the engine properties, which is the intention anyway.
     * We can therefore identify an engine in the same way that Rex deals with entities or
     * relationships.
     *
     * We also need the OMES service instance GUID because we need to connect an edge to it.
     * This is available from the fields in the requestSummary.
     */

    let omesServiceInstanceGUID          = requestSummary.requestContextCorrelator;

    let engineGUID                       = engineDetails.engineGUID;

    let engine                            = {};
    engine.guid                           = engineDetails.engineGUID;
    engine.category                       = "engine-instance";
    engine.engineGUID                     = engineDetails.engineGUID;
    engine.engineDisplayName              = engineDetails.engineDisplayName;
    engine.engineQualifiedName            = engineDetails.engineQualifiedName;
    engine.engineDescription              = engineDetails.engineDescription;
    engine.engineTypeDescription          = engineDetails.engineTypeDescription;
    engine.engineVersion                  = engineDetails.engineVersion;
    engine.serviceMap                     = engineDetails.serviceMap;

    /*
     * Stash the omesServiceInstanceGUID of the instance that is running this engine
     * We will need it later if the user refocusses the engine.
     */
    engine.omesServiceInstanceGUID        = omesServiceInstanceGUID;


    /*
     * Create a map of the objects to be updated.
     */
    let update_objects                    = {};
    update_objects.resources              = {};
    update_objects.relationships          = {};
    update_objects.resources[engineGUID]  = engine;


    /*
     * The service hosting the engine must already be in he gens, so create am edge from it
     * to the engine.
     *
     * Create a relationship from the OMES to the engine, if we do not already have one.
     * The relationship will need a guid, a source and target and a gen (which is assigned when the
     * gen is created)
     */

    /*
     * Synthesize a relationship from the server instance to this service instance...
     * This edge should always be 1:1 with the engine instance (every engine
     * has one OMES service instance that is running it); so it can share the same GUID
     * as the engine.
     */

    let edgeGUID             = engineGUID;
    let edge                 = {};
    edge.category            = "service-engine-edge";
    edge.guid                = edgeGUID;
    edge.engineQualifiedName = engineDetails.engineQualifiedName;

    /*
     * Include graph navigation ids.
     */

    edge.source              = omesServiceInstanceGUID;
    edge.target              = engineGUID;

    update_objects.relationships[edgeGUID] = edge;

    updateGens(update_objects, requestSummary);

    /*
     * Only make the engine the focus if the caller requested that.
     * Focus is applied when the user has clicked on a node in the diagram; it is not applied
     * when a service list entry is merely expanded.
     */

    if (makeFocus) {
      setFocus( { category : "engine-instance", guid : engineGUID } );
    }

    /*
     * Indicate that the load operation is complete
     */
    setOperationState( { state:"inactive", name:""} );
  };



  return (
    <ResourcesContext.Provider
      value={{      
        /*
         * Local state
         */
        focus,
        serverConfig,
        operationState,
        gens,
        availablePlatforms,
        /*
         * Getters
         */
        getFocusPlatform,
        getFocusServer,
        getFocusService,
        getFocusEngine,
        getLatestGenId,
        getNumGens,
        getLatestGen,
        getGens,
        resourceExists,
        /*
         * Operations
         */
        loadPlatform,
        loadServer,   
        loadServerConfiguration,
        loadServerFromSelector,
        loadServersFromPlatformQuery,
        changeFocusResource,
        selectTargetResource,
        loadCohort,
        loadCohortFromServer,
        loadService,
        loadEngine,
        loadIntegrationServices,
        loadEngineServices,
        loadConfiguredCohort,
        clear,
        removeGen,
        getActiveServers,
        getKnownServers,
        genServiceInstanceGUID,
        genCohortGUID,
        loadPartnerOMAS,
        setAvailablePlatforms
      }}
    >      
    {props.children}
    </ResourcesContext.Provider>
  );
};

ResourcesContextProvider.propTypes = {
  children: PropTypes.node  
};

export default ResourcesContextProvider;
