# Security Fixes

The build runs runs and spots vulnerabilities.
Also locally you can run npm audit to list vulnerabilities. 
Over time more and more vultnerabilities will be flagged by these mechanisms. This file is to keep track of the outstanding security fixes and how they are being addressed.

npm audit fix should run regularly on cra-client and cra-server. This should fix any components that can be upgraded with a non-breaking change. 

## Current limitations


None
* cra-server - ```npm audit``` has 0 vulnerabilities
* cra-client - ```npm audit --prod``` has 0 vulnerabilities


As of 28/03/23 (latest activity first)

* 28/03/23 updated d3 to 2.0 - npm audit said this was a breaking change but it seemed to work. 

* 02/02/22 We decided to revert the forced resolutions and suggest that ```npm audit --prod``` should be run. This only checks production considerations. Pr https://github.com/odpi/egeria-react-ui/pull/347 moved the react-scripts and postcss depenancies mentioned below to be dev dependancies. For cra-client this gives 0 vulnerabilities.


* 30/01/22 cra-client issue https://github.com/odpi/egeria-react-ui/issues/344. It seems most of the non high vulnerabilities relate to the level of postcss. Postcss
needs to be migrated to a higher level postcss to >=8.2.13. 

I found this issue [https://github.com/facebook/create-react-app/issues/10945](https://github.com/facebook/create-react-app/issues/10945). Indicating that the postcss vulnerabilities are false positives as it can only occur at dev time. I tried moving the postcss dependancy to the dev dependancy as advised in the link; but npm audit still showed the errors.


the errors look like this :

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular Expression Denial of Service in postcss              │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ postcss                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=8.2.13                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts [dev]                                          │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > resolve-url-loader > postcss                 │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://github.com/advisories/GHSA-566m-qj78-rww5            │
└───────────────┴──────────────────────────────────────────────────────────────┘

```

* 30/01/22 cra-client issue [https://github.com/odpi/egeria-react-ui/issues/342](https://github.com/odpi/egeria-react-ui/issues/342) was raised to address a critical issue in Immer. 

Note I tried forcing the resolution but npm list now gives errors.

There is a lot of discussion about this not actually effecting runtime. 

* 30/01/22 cra-server has no vulnerabilities according to ```npm audit```

