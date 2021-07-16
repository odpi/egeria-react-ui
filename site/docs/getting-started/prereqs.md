<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the ODPi Egeria project. -->

# Getting Started - prerequisites

Egeria is about integrating metadata from different sources in a peer to peer manner; the open types are the language of this integration. [Egeria Solutions](https://github.com/odpi/egeria/tree/master/open-metadata-publication/website/solutions) can be sophisicated, but to get started with the Egeria React UI you can use a simple setup, with : 

* [A Metadata repository server](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/metadata-server.html)
* [A View server](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/view-server.html)

Each user interface capability in the presentation server requires an associated view service. To use a particular UI capability you need to 
have the equivalient view service configured and active; follow [these intructions](https://egeria.odpi.org/open-metadata-implementation/admin-services/docs/concepts/view-server.html) to set up the view services. The name of the UI capability is the same as the name of the view service. Be aware that a view
service has a downstream dependancy as well, for example the Glossary Author View service calls the downstream dependancy [Subject Area OMAS](https://egeria.odpi.org/open-metadata-implementation/access-services/subject-area/), which also needs to be configured and active. 
