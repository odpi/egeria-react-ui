# Security Fixes

The build solar scan runs and spots vulnerabilities.
Also locally you can run npm audit to list vulnerabilities. 
Over time more and more vultnerabilities will be flagged by these mechanisms. This file is to keep track of the outstanding security fixed and how they are bing addressed.

npm audit fix should run regularly on cra-client and cra-server. This should fix any components that can be upgraded with a non-breaking change. 

## Current limitations
The 2 high vultnerabilities have no patches available. npm list shows 

```

High          │ Uncontrolled Resource Consumption in ansi-html               │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ ansi-html                                                    │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ No patch available                                           │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > @pmmmwh/react-refresh-webpack-plugin >       │
│               │ ansi-html                                                    │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://github.com/advisories/GHSA-whgm-jr23-g3j9            │
└───────────────┴──────────────────────────────────────────────────────────────┘
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ High          │ Uncontrolled Resource Consumption in ansi-html               │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ ansi-html                                                    │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ No patch available                                           │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > webpack-dev-server > ansi-html               │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://github.com/advisories/GHSA-whgm-jr23-g3j9      


```




As of 30/01/22 (latest activity first)

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

* 30/01/22 cra-client issue [https://github.com/odpi/egeria-react-ui/issues/342](https://github.com/odpi/egeria-react-ui/issues/342) was raised to address a critical issue in Immer. Note that npm list now gives errors - I asusme this is a consequence of the forced resolution.

** Before**
```npm audit gives
found 94 vulnerabilities (2 low, 87 moderate, 4 high, 1 critical) in 2485 scanned packages
  91 vulnerabilities require semver-major dependency updates.
  3 vulnerabilities require manual review. See the full report for details.```



There is a lot of discussion about this not actually effecting runtime. The fix that was recommended was to force the level of Immer. The fix forthis introduced some force resolutions including that of Immer. This brings the oustanding vulnerabilities to :
**After fix**
```found 86 vulnerabilities (84 moderate, 2 high)```

* 30/01/22 cra-server has no vulnerabilities 

