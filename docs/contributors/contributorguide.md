<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project. -->

# Contributers guide

## 1. Version considerations 
NPM package.json files exist in folders cra-client and cra-server; these packages describe the Egeria React UI client and server respectively.
The version defined in these files is intended to match an Egeria version; this is so that Docker images can be constructed with 
matching levels of this UI and the Egeria to which it is communicating. 

When Egeria is released with a new version, the versions in the 2 package.json files should match the Egeria version, for example Egeria release z.y.x (e.g. 2.6.0)
will match the package.json's which both specify version z.y.x. When the UI code is being developed, the version is z.y-rc.x (2.7-rc.0); the rc indciates that the
code is a release candidate (rc) for the next version of Egeria (2.7.0 in this example).      

Note that the 2 Egeria React UI npm packages are not, at this time, published to NPM.  


## 2 A note to the developers managing the creation of new versions

The version in the package.json can be updated using he command 'npm version preminor -preid rc' or can be editted directly in the package.json file.

## 3. Release Notes

Refer to github change history.

## 4. Project structure
This project is a [Create React App](https://reactjs.org/docs/create-a-new-react-app.html). 


## 5. cra-server
This is the Express server (also known as the presentation server). the cra - stands for Create React app.

  * db - this is the in memory database used for the simple authentication for demo purposes
  * functions - common functions
  * node_modules - dependant node modules
  * router - the middleware routes that node uses to process incoming requests
  * validations - validation of incoming content 

## 6. cra-client
This is the client code including the javascript. the cra - stands for Create React app.

  * build - this is where the client code is built for use in production 
  * node_modules - dependant node modules
  * public - resources
  * src - source code, containsthe Node app, scss, and the frame in which all the components live. 
    * components - contains the home screen and subfolders for each UI capability component
    * contexts - React contexts 
    * images - images, javascript wrappers of the the svg images with size. 
    * imagesHolder - this contains the svg images, grouped in folders to indicate their origin 

## 7. SSL
   The ssl folder contains ssl orientated content for demo purposes. The [core egeria project](https://github.com/odpi/egeria) contains a [certificates folder](https://github.com/odpi/egeria/tree/main/open-metadata-resources/open-metadata-deployment/certificates). These certificates are generated as sample artifacts to show aspects of securing an Egeria eco-system. They should not be used in production as they rely on self signed certificates. By default, the Egeria React UI runs with these default certificates and the Egeria certificate authority. The React UI Egeria community copy over files from the [certificates folder] into the React UI top level ssl folder. As the certifictes have expiry dates in them, the React UI could fail to work if left using expired certificates. The React UI should be updated to match any new Egeria certificate content (include when they are regeneated with updated expiration); to allow the presentation server to continue to communicate with Egeria the view services.   

## 8. There is ongoing work to enable easy running of the Presentation Server in a demo environment

 * The Coco Pharmaceuticals 'lab' tutorial environment will now configure the view services, and allow a user to experiment with the Presentation Server
 * The 'egeria-server-config' notebook has code added to configure the view services - so once this & egeria-server-start is run, Presentation Server is available.
 * The Presentation Server code is built under maven (mvn clean install) & added to a new assembly (open-metadata-distribution/open-metadata-assemblies) as part of the overall build.
 * A new docker image is created as 'odpi/egeria-presentation-server' containing Presentation Server.
 * Our docker-compose based tutorial now has Presentation Server included & configured via the environment variable, and accessed at https://localhost:18091/coco/login .
 * The Kubernetes tutorial 'odpi-egeria-lab' has also been updated similarly, with the Presentation Server UI being acessible via port 30091 - ie access via https:\<address-of-k8s-node\>/coco.login
 * For the lab environment it is recommended to use user 'garygeeke' and password 'admin' since this environment has security setup, and other users including faithbroker will not have access to all capabilities. 
 * This is still work in progress. For example if the session times out you will need to go to the UI URL again manually.
 * Contact us via Slack on odpi.slack.com to get additional guidance.

