/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const getLineType = (GlossaryAuthorURL, key) => {
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
    "expression",
    {
      key: "expression",
      label: "Expression",
    }
  ];


  const summaryResponseAttributes= [
    {
      key: "guid",
      label: "Guid",
    },
  ];

  const LineTypes = {
    termanchor: {
      key: "term-anchor",
      plural: "term-anchors",
      typeName: "TermAnchor",
    },
    categoryanchor: {
      key: "category-anchor",
      plural: "category-anchors",
      typeName: "CategoryAnchor"
    },
    categoryhierachylink: {
      key: "category-hierarchy",
      plural: "category-hierarchies",
      typeName: "CategoryHierarchyLink"
    },
    projectscopes: {
      key: "project-scope",
      plural: "project-scopes",
      typeName: "ProjectScope"
    },  
    hasa: {
      key: "has-a",
      plural: "has-as",
      typeName: "HasA",
      isRelatedTerm: true
    },
    synonym: {
      key: "synonym",
      plural: "synonym",
      typeName: "Synonym",
      isRelatedTerm: true,
      hasExpression: true
    },    
    antonym: {
      key: "antonym",
      plural: "antonym",
      typeName: "Antonym",
      isRelatedTerm: true
    },  
    relatedterm: {
      key: "related-term",
      plural: "related-terms",
      typeName: "RelatedTerm",
      isRelatedTerm:  true
    },     
    preferredterm: {
      key: "preferred-term",
      plural: "preferred-terms",
      typeName: "PreferredTerms",
      isRelatedTerm:  true
    }, 
    validValue: {
      key: "valid-value",
      plural: "valid-values",
      typeName: "ValidValue",
      isRelatedTerm:  true
    }, 
    replacementerm: {
      key: "replacement-term",
      plural: "replacement-terms",
      typeName: "ReplacementTerm",
      isRelatedTerm:  true
    }, 
    typedby: {
      key: "typed-by",
      plural: "typed-bys",
      typeName: "TypedBy",
      isRelatedTerm:  true
    },  
    isa: {
      key: "is-a",
      plural: "is-as",
      typeName: "IsA",
      isRelatedTerm:  true
    },  
    isatypeof: {
      key: "is-a-type-of",
      plural: "is-a-type-ofs",
      typeName: "IsATypeOf",
      isRelatedTerm:  true
    },  
    categorization: {
      key: "term-categorization",
      plural: "term-categorizations",
      typeName: "Categorization",
      attributes: [
        {
          key: "status",
          label: "Status",
          // TODO implement enum values
        }
      ]
    },  
    
    usedincontext: {
      key: "used-in-context",
      plural: "used-in-contexts",
      typeName: "UsedInContext",
      isRelatedTerm: true
    },     
    translation: {
      key: "translation",
      plural: "translations",
      typeName: "Translation",
      isRelatedTerm: true
    },     
    notSet: {
      key: "undefined",
      plural: "undefined",
      typeName: "undefined",
    },
  };
  console.log("getLineType key " + key);
  let lineType = LineTypes[key];
  console.log("getLineType Linetype " + lineType);
  if (lineType.isRelatedTerm) {
    // add in the related term attributes
    lineType["attributes"] = relatedTermAttributes;
  }
  lineType["summaryResponseAttributes"] = summaryResponseAttributes;
  if (lineType) {
    lineType.url =
      GlossaryAuthorURL +
      "/relationships/" +
      lineType.plural;
  } else {
    console.log("No line type for key " + key);
    lineType = lineType["notSet"];
  }
  return lineType;
};

export default getLineType;
