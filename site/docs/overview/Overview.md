<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project. -->
# Egeria React UI Overview

The Egeria React UI isa React multi tenant User Interface for Open Metadata and Governance. It is part of the [Egeria](https://github.com/odpi/egeria/blob/master/README.md) project; as such it is bound by the same code of conduct, governance etc and it part of the Egeria community (and community calls).  

This Git repository contains the Egeria React User Interface (UI), which provides a multi tenanted, persona based interface for users to work with Egeria solutions and Egeria ecosystem tools. 

This repository is separate from the main Egeria repository, because the technology and build infrastructure is sufficiently different for the User interface. 
Egeria React User Interface developers work with nodejs, develop in javascript, use the React framework and use npm; whereas the main Egeria repository attracts developers with Java skills.  

The **Presentation Server** is a multi-tenant persona based server that serves a user interface - it issues rest calls downstream primarily to [view servers](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/view-server.html)

See the [Egeria Planning guide](https://egeria.odpi.org/open-metadata-publication/website/planning-guide/) to familiarise yourself with 
the types of [Egeria OMAG Servers](https://egeria.odpi.org/open-metadata-implementation/docs/concepts/omag-server.md). There is an Egeria tutorial on setting up Egeria servers can be following (Egeria Dojo](https://egeria.odpi.org/open-metadata-resources/open-metadata-tutorials/egeria-dojo/), but this does not detail the parts to do with the presentation server and this UI.

There are 2 types of capabilities in the Presentation Server.

* [Ecosystem Tools](../ecosystem/ecosystem.md)
* [Solutions](../solutions/solutions.md)


----
License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/),
Copyright Contributors to the ODPi Egeria project.

