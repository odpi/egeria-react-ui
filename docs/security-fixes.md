# Security Fixes

The build solar scan runs and spots vulnerabilities.
Also locally you can run npm audit to list vulnerabilities. 
Over time more and more vultnerabilities will be flagged by these mechanisms. This file is to keep track of the outstanding security fixed and how they are bing addressed.

npm audit fix should run regularly. This should fix any components that can be upgraded with a non-breaking change. 

As of 30/01/22 

* issue [https://github.com/odpi/egeria-react-ui/issues/342](https://github.com/odpi/egeria-react-ui/issues/342) was raised to address a critical issue in Immer. 

```npm audit gives
found 94 vulnerabilities (2 low, 87 moderate, 4 high, 1 critical) in 2485 scanned packages
  91 vulnerabilities require semver-major dependency updates.
  3 vulnerabilities require manual review. See the full report for details.```



There is a lot of discussion about this not actually effecting runtime. The fix that was recommended was to force the level of Immer. The fix forthis introduced some force resolutions including that of Immer. This brings the oustanding vulnerabilities to :

```found 86 vulnerabilities (84 moderate, 2 high)```











