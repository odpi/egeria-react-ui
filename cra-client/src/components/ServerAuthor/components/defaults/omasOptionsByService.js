/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const omasOptionsByService = {
  "asset-catalog": ["supportedZone"],
  "asset-consumer": ["supportedZone"],
  "data-privacy": ["supportedZone"],
  "devops": ["supportedZone"],
  "information-view": ["supportedZone"],
  "it-infrastructure": ["supportedZone"],
  "project-management": ["supportedZone"],
  "security-officer": ["supportedZone"],
  "software-developer": ["supportedZone"],
  "stewardship-action": ["supportedZone"],
  "asset-lineage": ["supportedZone", "glossaryTermLineageEventsChunkSize"],
  "data-manager": ["defaultZone", "supportedZone", "publishedZone"],
  "asset-owner": ["defaultZone", "supportedZone", "publishedZone"],
  "data-engine": ["defaultZone", "supportedZone", "publishedZone"],
  "data-platform": ["defaultZone", "supportedZone", "publishedZone"],
  "digital-architect": ["defaultZone", "supportedZone", "publishedZone"],
  "digital-service": ["defaultZone", "supportedZone", "publishedZone"],
  "discovery-engine": ["defaultZone", "supportedZone", "publishedZone"],
  "govenance-engine": ["defaultZone", "supportedZone", "publishedZone"],
  "security-manager": ["defaultZone", "supportedZone", "publishedZone"],
  "community-profile": ["defaultZone", "supportedZone", "publishedZone", "KarmaPointPlateau", "KarmaPointIncrement"]
}


export default omasOptionsByService;