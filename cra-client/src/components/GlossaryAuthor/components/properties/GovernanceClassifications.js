/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

export const getEnumValuesFromName = (name) => {
  if (name === "retentionBasis") {
    return retentionBasis;
  } else if (name === "confidentialityLevel") {
    return confidentialityLevel;
  } else if (name === "confidenceLevel") {
    return confidenceLevel;
  } else if (name === "criticalityLevel") {
    return criticalityLevel;
  } else if (name === "governanceClassificationStatus") {
    return governanceClassificationStatus;
  } else {
    return undefined;
  }
};
/**
 * Enum for retention basis. Keep in Sync with the Egeria core type
 * @readonly
 * @enum {{index: integer, description: string}}
 */
const retentionBasis = Object.freeze({
  /**
   * There is no assessment of the retention requirements for this data.
   */
  Unclassified: {
    index: 0,
    description:
      "There is no assessment of the retention requirements for this data.",
  },
  /**
   * This data is temporary.
   */
  Temporary: { index: 1, description: "This data is temporary." },
  /**
   * The data is needed for the lifetime of the referenced project.
   */
  ProjectLifetime: {
    index: 2,
    description:
      "The data is needed for the lifetime of the referenced project.",
  },
  /**
   * The data is needed for the lifetime of the referenced team.
   */
  TeamLifetime: {
    index: 3,
    description: "The data is needed for the lifetime of the referenced team.",
  },
  /**
   * The data is needed for the lifetime of the referenced contract.
   */
  ContractLifetime: {
    index: 4,
    description:
      "The data is needed for the lifetime of the referenced contract.",
  },
  /**
   * The retention period for the data is defined by the referenced regulation.
   */
  RegulatedLifetime: {
    index: 5,
    description:
      "The retention period for the data is defined by the referenced regulation.",
  },
  /**
   * The data is needed for the specified time.
   */
  TimeBoxedLifetime: {
    index: 6,
    description: "The data is needed for the specified time.",
  },
  /**
   * Another basis for determining the retention requirement.
   */
  Other: {
    index: 99,
    description: "Another basis for determining the retention requirement.",
  },
});

/**
 * Enum for confidentiality level. Keep in Sync with the Egeria core type
 * @readonly
 * @enum {{index: integer, description: string}}
 */
const confidentialityLevel = Object.freeze({
  /**
   * The data is public information.
   */
  Unclassified: { index: 0, description: "The data is public information." },
  /**
   * The data should not be exposed outside of this organization.
   */
  Internal: {
    index: 1,
    description: "The data should not be exposed outside of this organization.",
  },
  /**
   * The data should be protected and only shared with people with a need to see it.
   */
  Confidential: {
    index: 2,
    description:
      "The data should be protected and only shared with people with a need to see it.",
  },
  /**
   * The data is sensitive and inappropriate use may adversely impact the data subject.
   */
  Sensitive: {
    index: 3,
    description:
      "The data is sensitive and inappropriate use may adversely impact the data subject.",
  },
  /**
   * The data is very valuable and must be restricted to a very small number of people.
   */
  Restricted: {
    index: 4,
    description:
      "The data is very valuable and must be restricted to a very small number of people.",
  },
  /**
   * Another confidentially level.
   */
  Other: { index: 99, description: "Another confidentially level." },
});

/**
 * Enum for confidence level. Keep in Sync with the Egeria core type
 * @readonly
 * @enum {{index: integer, description: string}}
 */
const confidenceLevel = Object.freeze({
  /**
   * There is no assessment of the confidence level of this data.
   */
  Unclassified: {
    index: 0,
    description: "There is no assessment of the confidence level of this data.",
  },
  /**
   * The data comes from an ad hoc process.
   */
  AdHoc: { index: 1, description: "The data comes from an ad hoc process." },
  /**
   * The data comes from a transactional system so it may have a narrow scope.
   */
  Transactional: {
    index: 2,
    description:
      "The data comes from a transactional system so it may have a narrow scope.",
  },
  /**
   * The data comes from an authoritative source.
   */
  Authoritative: {
    index: 3,
    description: "The data comes from an authoritative source.",
  },
  /**
   * The data is derived from other data through an analytical process.
   */
  Derived: {
    index: 4,
    description:
      "The data is derived from other data through an analytical process.",
  },
  /**
   * The data comes from an obsolete source and must no longer be used.
   */
  Obsolete: {
    index: 5,
    description:
      "The data comes from an obsolete source and must no longer be used.",
  },
  /**
   * Another confidence level.
   */
  Other: { index: 99, description: "Another confidence level." },
});
/**
 * Enum for governance classification status. Keep in Sync with the Egeria core type
 * @readonly
 * @enum {{index: integer, description: string}}
 */
const governanceClassificationStatus = Object.freeze({
  /**
   * The classification assignment was discovered by an automated process.
   */
  Discovered: {
    index: 0,
    description:
      "The classification assignment was discovered by an automated process.",
  },
  /**
   * The classification assignment was proposed by a subject matter expert.
   */
  Proposed: {
    index: 1,
    description:
      "The classification assignment was proposed by a subject matter expert.",
  },
  /**
   * The classification assignment was imported from another metadata system.
   */
  Imported: {
    index: 2,
    description:
      "The classification assignment was imported from another metadata system.",
  },
  /**
   * The classification assignment has been validated and approved by a subject matter expert.
   */
  Validated: {
    index: 3,
    description:
      "The classification assignment has been validated and approved by a subject matter expert.",
  },
  /**
   * The classification assignment should no longer be used.
   */
  Deprecated: {
    index: 4,
    description: "The classification assignment should no longer be used.",
  },
  /**
   * The classification assignment must no longer be used.
   */
  Obsolete: {
    index: 5,
    description: "The classification assignment must no longer be used.",
  },
  /**
   * Another classification assignment status.
   */
  Other: {
    index: 99,
    description: "Another classification assignment status.",
  },
});
/**
 * Enum for criticility level. Keep in Sync with the Egeria core type
 * @readonly
 * @enum {{index: integer, description: string}}
 */
const criticalityLevel = Object.freeze({
  /**
   * There is no assessment of the criticality of this data.
   */
  Unclassified: {
    index: 0,
    description: "There is no assessment of the criticality of this data.",
  },
  /**
   * The data is of minor importance to the organization.
   */
  Marginal: {
    index: 1,
    description: "The data is of minor importance to the organization.",
  },
  /**
   * The data is important to the running of the organization.
   */
  Important: {
    index: 2,
    description: "The data is important to the running of the organization.",
  },
  /**
   * The data is critical to the operation of the organization.
   */
  Critical: {
    index: 3,
    description: "The data is critical to the operation of the organization.",
  },
  /**
   * The data is so important that its loss is catastrophic putting the future of the organization in doubt.
   */
  Catastrophic: {
    index: 4,
    description:
      "The data is so important that its loss is catastrophic putting the future of the organization in doubt.",
  },
  /**
   * Another criticality level.
   */
  Other: { index: 99, description: "Another criticality level." },
});

export const getGovernanceClassification = (key) => {
  const governanceClassifications = {
    confidentiality: {
      key: "confidentiality",
      typeName: "Confidentiality",
      attributes: [
        {
          key: "status",
          label: "Status",
          type: "enum",
          enumValues: "governanceClassificationStatus",
        },
        {
          key: "confidence",
          label: "Confidence",
          type: "integer",
        },
        {
          key: "steward",
          label: "Steward",
        },
        {
          key: "source",
          label: "Source",
        },
        {
          key: "notes",
          label: "Notes",
        },
        {
          key: "level",
          label: "Level",
          type: "enum",
          enumValues: "confidentialityLevel",
        },
      ],
    },
    confidence: {
      key: "confidence",
      typeName: "Confidence",
      attributes: [
        {
          key: "status",
          label: "Status",
          type: "enum",
          enumValues: "governanceClassificationStatus",
        },
        {
          key: "confidence",
          label: "Confidence",
          type: "integer",
        },
        {
          key: "steward",
          label: "Steward",
        },
        {
          key: "source",
          label: "Source",
        },
        {
          key: "notes",
          label: "Notes",
        },
        {
          key: "level",
          label: "Level",
          type: "enum",
          enumValues: "confidenceLevel",
        },
      ],
    },
    criticality: {
      key: "criticality",
      typeName: "Criticality",
      attributes: [
        {
          key: "status",
          label: "Status",
          type: "enum",
          enumValues: "governanceClassificationStatus",
        },
        {
          key: "confidence",
          label: "Confidence",
          type: "integer",
        },
        {
          key: "steward",
          label: "Steward",
        },
        {
          key: "source",
          label: "Source",
        },
        {
          key: "notes",
          label: "Notes",
        },
        {
          key: "level",
          label: "Level",
          type: "enum",
          enumValues: "criticalityLevel",
        },
      ],
    },
    retention: {
      key: "retention",
      typeName: "Retention",
      attributes: [
        {
          key: "status",
          label: "Status",
          type: "enum",
          enumValues: "governanceClassificationStatus",
        },
        {
          key: "confidence",
          label: "Confidence",
          type: "integer",
        },
        {
          key: "steward",
          label: "Steward",
        },
        {
          key: "source",
          label: "Source",
        },
        {
          key: "notes",
          label: "Notes",
        },
        {
          key: "level",
          label: "Level",
          type: "integer",
        },
        {
          key: "basis",
          label: "Basis",
          type: "enum",
          enumValues: "retentionBasis",
        },
        {
          key: "associatedGUID",
          label: "Associated GUID",
        },
        // {
        //   key: "archiveAfter",
        //   label: "Archive after",
        //   type: "date",
        // },
        // {
        //   key: "deleteAfter",
        //   label: "Delete after",
        //   type: "date",
        // },
      ],
    },
    notSet: {
      key: "undefined",
      plural: "undefined",
      typeName: "undefined",
    },
    error: {
      key: "error",
      plural: "error",
      typeName: "Error",
      attributes: [
        {
          key: "name",
          label: "Name",
        },
        {
          key: "description",
          label: "Description",
        },
        {
          key: "qualifiedName",
          label: "Qualified Name",
        },
      ],
    },
  };
  console.log("looking for key " + key);
  let governanceClassification = governanceClassifications[key];

  if (!governanceClassification) {
    governanceClassification = governanceClassifications["notSet"];
  }
  return governanceClassification;
};
