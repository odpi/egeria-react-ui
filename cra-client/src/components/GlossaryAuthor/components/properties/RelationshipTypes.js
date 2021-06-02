/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const getRelationshipType = (GlossaryAuthorURL, key) => {
  const relatedTermAttributes = [
    {
      key: "description",
      label: "Description",
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
      key: "status",
      label: "Status",
      // TODO implement enum values
    },
    {
      key: "expression",
      label: "Expression",
    },
  ];

  const summaryResponseAttributes = [
    {
      key: "guid",
      label: "Guid",
    },
  ];

  const RelationshipTypes = {
    termanchor: {
      key: "term-anchor",
      plural: "term-anchors",
      typeName: "TermAnchor",
    },
    categoryanchor: {
      key: "category-anchor",
      plural: "category-anchors",
      typeName: "CategoryAnchor",
    },
    categoryhierarchylink: {
      key: "category-hierarchy-link",
      plural: "category-hierarchy-links",
      typeName: "CategoryHierarchyLink",
    },
    projectscopes: {
      key: "projectscope",
      plural: "project-scopes",
      typeName: "ProjectScope",
    },
    hasa: {
      key: "hasa",
      plural: "has-as",
      label: "Has a",
      typeName: "HasA",
      isRelatedTerm: true,
      description:
        "Defines the relationship between a spine object and a spine attribute.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "objects",
        attributeDescription: "Objects where this attribute may occur.",
        attributeVerbWithAttributeAsSubject: "has a",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "attributes",
        attributeDescription: "Typical attributes for this object.",
        attributeVerbWithAttributeAsSubject: "is part of",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    synonym: {
      key: "synonym",
      plural: "synonyms",
      label: "Synonym",
      typeName: "Synonym",
      isRelatedTerm: true,
      hasExpression: true,
      description: "Link between glossary terms that have the same meaning.",
      end1: {
        attributeName: "synonyms",
        attributeDescription: "Glossary terms with the same meaning.",
        attributeVerbWithAttributeAsSubject: "has the same meaning as",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        attributeName: "synonyms",
        attributeDescription: "Glossary terms with the same meaning.",
        attributeVerbWithAttributeAsSubject: "has the same meaning as",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    antonym: {
      key: "antonym",
      plural: "antonyms",
      typeName: "Antonym",
      label: "Antonym",
      isRelatedTerm: true,
      description:
        "Link between glossary terms that have the opposite meaning.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "antonyms",
        attributeDescription: "Glossary terms with the opposite meaning.",
        attributeVerbWithAttributeAsSubject: "has the opposite meaning from",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "antonyms",
        attributeDescription: "Glossary terms with the opposite meaning.",
        attributeVerbWithAttributeAsSubject: "has the opposite meaning from",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    relatedterm: {
      key: "relatedterm",
      plural: "related-terms",
      label: "Related Term",
      typeName: "RelatedTerm",
      isRelatedTerm: true,
      description: "Link between similar glossary terms.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "seeAlso",
        attributeDescription: "Related glossary terms.",
        attributeVerbWithAttributeAsSubject: "is related to",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "seeAlso",
        attributeDescription: "Related glossary terms.",
        attributeVerbWithAttributeAsSubject: "is related to",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    preferredterm: {
      key: "preferredterm",
      plural: "preferred-terms",
      label: "Preferred Term",
      typeName: "PreferredTerm",
      isRelatedTerm: true,
      description:
        "Link to an alternative term that the organization prefer is used.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "alternateTerms",
        attributeDescription: "Alternative glossary terms.",
        attributeVerbWithAttributeAsSubject: "is an alternative term to",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "preferredTerms",
        attributeDescription: "Related glossary terms.",
        attributeVerbWithAttributeAsSubject: "is preferred to",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    validvalue: {
      key: "validvalue",
      plural: "valid-values",
      label: "Valid Value",
      typeName: "ValidValue",
      isRelatedTerm: true,
      description:
        "Link between glossary terms where one defines one of the data values for the another.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "validValueFor",
        attributeDescription:
          "Glossary terms for data items that can be set to this value.",
        attributeVerbWithAttributeAsSubject: "is a Valid Value for Term",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "validValues",
        attributeDescription:
          "Glossary terms for data values that can be used with data items represented by this glossary term.",
        attributeVerbWithAttributeAsSubject: "has a Valid Value of",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    replacementterm: {
      key: "replacementterm",
      plural: "replacement-terms",
      label: "Replacement Term",
      typeName: "ReplacementTerm",
      isRelatedTerm: true,
      description:
        "Link to a glossary term that is replacing an obsolete glossary term.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "replacedTerms",
        attributeDescription: "Replaced glossary terms.",
        attributeVerbWithAttributeAsSubject: "is replaced by",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "replacementTerms",
        attributeDescription: "Replacement glossary terms.",
        attributeVerbWithAttributeAsSubject: "replaces",
        attributeCardinality: "ANY_NUMBER",
      },
    },

    isatypeof: {
      key: "isatypeof",
      plural: "is-a-type-ofs",
      label: "is a type of",
      isRelatedTerm: true,
      typeName: "IsATypeOf",
      description:
        "Defines an inheritance relationship between two spine objects.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "supertypes",
        attributeDescription: "Supertypes for this object.",
        attributeVerbWithAttributeAsSubject: "is the super type of",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "subtypes",
        attributeDescription: "Subtypes for this object.",
        attributeVerbWithAttributeAsSubject: "is the sub type of",
        attributeCardinality: "ANY_NUMBER",
      },
    },

    typedby: {
      key: "typedby",
      plural: "typed-bys",
      label: "Typed by",
      typeName: "TypedBy",
      isRelatedTerm: true,
      description:
        "Defines the relationship between a spine attribute and its type.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "attributesTypedBy",
        attributeDescription: "Attributes of this type.",
        attributeVerbWithAttributeAsSubject: "has the type",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "types",
        attributeDescription: "Types for this attribute.",
        attributeVerbWithAttributeAsSubject: "is the type of",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    isa: {
      key: "is-a",
      plural: "is-as",
      label: "Is a",
      typeName: "IsA",
      isRelatedTerm: true,
      description:
        "Link between a more general glossary term and a more specific definition.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "classifies",
        attributeDescription: "More specific glossary terms.",
        attributeVerbWithAttributeAsSubject: "is a more specific term of",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "isA",
        attributeDescription: "More general glossary terms.",
        attributeVerbWithAttributeAsSubject: "is a more general term of",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    isatypeof: {
      key: "isatypeof",
      plural: "is-a-type-ofs",
      label: "Is a type of",
      typeName: "IsATypeOf",
      isRelatedTerm: true,
      description:
        "Defines an inheritance relationship between two spine objects.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "supertypes",
        attributeDescription: "Supertypes for this object.",
        attributeVerbWithAttributeAsSubject: "is a supertype of",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "subtypes",
        attributeDescription: "Subtypes for this object.",
        attributeVerbWithAttributeAsSubject: "is a subtype of",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    categorization: {
      key: "term-categorization",
      plural: "term-categorizations",
      label: "Term categorization",
      typeName: "Categorization",
      attributes: [
        {
          key: "status",
          label: "Status",
          // TODO implement enum values
        },
      ],
    },

    usedincontext: {
      key: "usedincontext",
      plural: "used-in-contexts",
      label: "Used In Context",
      typeName: "UsedInContext",
      isRelatedTerm: true,
      description:
        "Link between glossary terms where on describes the context where the other one is valid to use.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "contextRelevantTerms",
        attributeDescription: "Glossary terms used in this specific context.",
        attributeVerbWithAttributeAsSubject: "have context",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "usedInContexts",
        attributeDescription:
          "Glossary terms describing the contexts where this term is used.",
        attributeVerbWithAttributeAsSubject: "is the context of",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    translation: {
      key: "translation",
      plural: "translations",
      label: "Translation",
      typeName: "Translation",
      isRelatedTerm: true,
      description:
        "Link between glossary terms that provide different natural language translation of the same concept.",
      end1: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "translations",
        attributeDescription: "Translations of glossary term.",
        attributeVerbWithAttributeAsSubject: "is a translation of",
        attributeCardinality: "ANY_NUMBER",
      },
      end2: {
        headerVersion: 1,
        entityType: {
          headerVersion: 1,
          guid: "0db3e6ec-f5ef-4d75-ae38-b7ee6fd6ec0a",
          name: "GlossaryTerm",
          status: "ACTIVE_TYPEDEF",
        },
        attributeName: "translations",
        attributeDescription: "Translations of glossary term.",
        attributeVerbWithAttributeAsSubject: "is a translation of",
        attributeCardinality: "ANY_NUMBER",
      },
    },
    notSet: {
      key: "undefined",
      plural: "undefined",
      label: "Relationship",
      typeName: "undefined",
    },
  };
  console.log("getRelationshipType key " + key);
  let relationshipType = RelationshipTypes[key];
  console.log("getRelationshipType RelationshipType " + relationshipType);
  if (relationshipType.isRelatedTerm) {
    // add in the related term attributes
    relationshipType["attributes"] = relatedTermAttributes;
  }
  relationshipType["summaryResponseAttributes"] = summaryResponseAttributes;
  if (relationshipType) {
    relationshipType.url =
      GlossaryAuthorURL + "/relationships/" + relationshipType.plural;
  } else {
    console.log("No relationship type for key " + key);
    relationshipType = relationshipType["notSet"];
  }
  return relationshipType;
};

export default getRelationshipType;
