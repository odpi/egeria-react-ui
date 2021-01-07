<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project. -->

![Egeria Logo](https://github.com/odpi/egeria/blob/master/assets/img/ODPi_Egeria_Logo_color.png)

[![GitHub](https://img.shields.io/github/license/odpi/egeria)](LICENSE)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/3044/badge)](https://bestpractices.coreinfrastructure.org/projects/3044)
[![Maven Central](https://img.shields.io/maven-central/v/org.odpi.egeria/egeria)](https://mvnrepository.com/artifact/org.odpi.egeria)


# Egeria React UI - a React multi tenant User Interface for Open Metadata and Governance
  
Egeria React UI is part of the [Egeria](https://github.com/odpi/egeria/blob/master/README.md) project; as such it is bound by the same code of conduct, 
governance etc and it part of the Egeria community (and community calls).  

This Git repository contains the Egeria React User Interface (UI), which provides a multi tenanted, persona based interface for users to work with Egeria solutions and Egeria ecosystem tools. 

This repository is separate from the main Egeria repository, because the technology and build infrastructure is sufficiently different for the User interface. 
Egeria React User Interface developers work with nodejs, develop in javascript, use the React framework and use npm; whereas the main Egeria repository attracts developers with Java skills.  

The **Presentation Server** is a multi-tenant persona based server that serves a user interface - it issues rest calls downstream primarily to [view servers](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/view-server.html)

See the [Egeria Planning guide](https://github.com/odpi/egeria/tree/master/open-metadata-publication/website/planning-guide) to familiarise yourself with 
the types of [Egeria OMAG Servers](https://egeria.odpi.org/open-metadata-implementation/docs/concepts/omag-server.md). There is an Egeria tutorial on setting up Egeria servers can be following (Egeria Dojo](https://egeria.odpi.org/open-metadata-resources/open-metadata-tutorials/egeria-dojo/), but this does not detail the parts to do with the presentation server and this UI.

There are 2 types of capabilities in the Presentation Server.
- Ecosystem Tools
- Solutions


## Ecosystem Tools

Egeria ecosystems, consist of platforms, on which servers run; these servers run services and communicate using cohorts. The ecosystem tools allows an infrastructure architect to configure, define, explore, navigate and operate the eco-system. Services work on open types and instances of these open types; these can also be explored using these tools. The ecosystem tools are 

- Type Explorer: allowing a user to explore the Egeria open types
- [RepositoryExplorer](docs/RepositoryExplorer/RepositoryExplorerGuide.md) : allowing a user to explore Egeria instances
- Server Author: allowing a user to configure a server. This is work in progress.
- Dino: allowing a user to see and work with Egeria platforms and servers operationally.    


## Solutions

These are user interface capabilities allowing particular personas to work with [Egeria Solutions](https://github.com/odpi/egeria/tree/master/open-metadata-publication/website/solutions). The solutions that are being developed are:

- [GlossaryAuthor](docs/GlossaryAuthor/GlossaryAuthorGuide.md): allowing a Glossary Author persona to create, update and delete Glossary content.   

The expectation is that more solutions will be developed by the community. 

## Getting started 

Egeria is about integrating metadata from different sources in a peer to peer manner; the open types are the language of this integration. [Egeria Solutions](https://github.com/odpi/egeria/tree/master/open-metadata-publication/website/solutions) can be sophisicated, but to get started with the Egeria React UI you can use a simple setup, with : 

* [A Metadata repository server](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/metadata-server.html)
* [A View server](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/view-server.html)

Each user interface capability in the presentation server requires an associated view service. To use a particular UI capability you need to 
have the equivalient view service configured and active; follow [these intructions](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/view-server.html) to set up the view services. The name of the UI capability is the same as the name of the view service. Be aware that a view
service has a downstream dependancy as well, for example the Glossary Author View service calls the downstream dependancy [Subject Area OMAS](https://github.com/odpi/egeria/blob/master/open-metadata-implementation/access-services/subject-area/README.md), which also needs to be configured and active. 

### The presentation server configuration 

The presentation server is an Express web server that serves the web resources, handles authentication and passes through rest calls to the view service. It is intended to be a thin layer in front of the view services. The presentation server lives in the folder called 'cra-server', it requires environment variables to be set to tell it where to send rest requests to for each tenant. If these is a file called .env in the 'cra-server folder then the contents of the file will be parsed and used as the envieronment variables. There is a sample .env file [.env_sample](cra-server/.env_sample).

#### The presentation server environment variable

The environment variable is: 
EGERIA_PRESENTATIONSERVER_SERVER_\<localServerName\>={"remoteServerName":"\<remoteServerName\>","remoteURL":"\<remoteURL\>"}

where
\<localServerName\> should be replaced with the local server name. This segment is the start segment of the url that the browser sends.
\<remoteServerName\> should be replaced with the remote server name. This is the name of the view service that has been configured in the view server.
\<remoteURL\> should be replaced with the remote root URL. This is the start of the URL on which the platform where the view server resides) is listening    

It is possible for multiple localServerName environment variables to be specified that each point to different 'view servers', this is the multi tenant support. The server name being the tenant name. 

Example:
EGERIA_PRESENTATIONSERVER_SERVER_aaa={"remoteServerName":"cocoView1","remoteURL":"https://localhost:9443"}


### Running the presentation server in production mode 
To run the presentation server in production mode, the javascipt and resources need to be [minified](https://reactjs.org/docs/optimizing-performance.html). To do this manually, navigate into `cra-client`, then run `npm run build`. The cra-client folder now should contain a `build` folder containing the artifiacts to run in production.  

On your development machine, you can run a production build, navigate into `cra-server` and run `npm run prod`.

To run on a production machine, copy over the cra-client and cra-server/build folders, maintaining their relative locations to the target machine. Run
`npm run prod` in the cra-server folder.

For tenant aaa, you should be able to login to the user interface using `http://localhost:8091/aaa/login`


### Running the presentation server in development mode 
Navigate to the `cra-client` and `cra-server` directories. Run `npm install` inside each. Then, navigate into `cra-server` and run `npm start`. 

After a couple of minutes while it builds, for tenant aaa, you should be able to login to the user interface using `http://localhost:3000/aaa/login`.


### Demo login credentials
For ecosystem tools use user 'garygeeke' and password 'admin'.
For glossary author use user 'faithbroker' and password 'admin'.


## Release Notes

TBA

## Project structure
This project is a [Create React App](https://reactjs.org/docs/create-a-new-react-app.html). 

* docs
  * design - design docs
  * [RepositoryExplorer](docs/RepositoryExplorer/RepositoryExplorerGuide.md)
  * [GlossaryAuthor](docs/GlossaryAuthor/GlossaryAuthorGuide.md)

* cra-server
This is the Express server (also known as the presentation server). the cra - stands for Create React app.
  * db - this is the in memory database used for the simple authentication for demo purposes
  * functions - common functions
  * node_modules - dependant node modules
  * router - the middleware routes that node uses to process incoming requests
  * validations - validation of incoming content 

* cra-client
This is the client code including the javascript. the cra - stands for Create React app.
  * build - this is where the client code is built for use in production 
  * node_modules - dependant node modules
  * public - resources
  * src - source code, containsthe Node app, scss, and the frame in which all the components live. 
    * components - contains the home screen and subfolders for each UI capability component
    * contexts - React contexts 
    * images - images, javascript wrappers of the the svg images with size. 
    * imagesHolder - this contains the svg images, grouped in folders to indicate their origin 

## There is ongoing work to enable easy running of the Presentation Server in a demo environment

 * The Coco Pharmaceuticals 'lab' tutorial environment will now configure the view services, and allow a user to experiment with the Presentation Server
 * The 'egeria-server-config' notebook has code added to configure the view services - so once this & egeria-server-start is run, Presentation Server is available.
 * The Presentation Server code is built under maven (mvn clean install) & added to a new assembly (open-metadata-distribution/open-metadata-assemblies) as part of the overall build.
 * A new docker image is created as 'odpi/egeria-presentation-server' containing Presentation Server.
 * Our docker-compose based tutorial now has Presentation Server included & configured via the environment variable, and accessed at https://localhost:18091/coco/login .
 * The Kubernetes tutorial 'odpi-egeria-lab' has also been updated similarly, with the Presentation Server UI being acessible via port 30091 - ie access via https:\<address-of-k8s-node\>/coco.login
 * For the lab environment it is recommended to use user 'garygeeke' and password 'admin' since this environment has security setup, and other users including faithbroker will not have access to all capabilities. 
 * This is still work in progress. For example if the session times out you will need to go to the UI URL again manually.
 * Contact us via Slack on odpi.slack.com to get additional guidance.
----
License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/),
Copyright Contributors to the ODPi Egeria project.

