/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

const getNodeType = (GlossaryAuthorURL, key) => {

  const nodeTypes = {
    project: {
      key: "project",
      plural: "projects",
      typeForCreate: "GlossaryProject",
      typeName: "Project",
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
      summaryResponseAttributes: [
        {
          key: "guid",
          label: "Guid",
        },
      ],
    },
    term: {
      key: "term",
      plural: "terms",
      typeName: "Term",
      hasGlossary: true,
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
        {
          key: "summary",
          label: "Summary",
        },
        {
          key: "abbreviation",
          label: "Abbreviation",
        },
        {
          key: "examples",
          label: "Examples",
        },
        {
          key: "usage",
          label: "Usage",
        },
        {
          key: "isSpineObject",
          label: "Is Spine Object",
          type: "flag",
          // do not allow this to be set on create. It should be set when a has-a relationship is created.
          notCreate: true
        },
        {
          key: "isSpineAttribute",
          label: "Is Spine Attribute",
          type: "flag",
          // do not allow this to be set on create. It should be set when a has-a relationship is created.
          notCreate: true
        },
        {
          key: "isObjectIdentifier",
          label: "Is Identifier",
          type: "flag",
          // do not allow this to be set on create. It should be set if required when a has-a relationship is created.
          notCreate: true
        }
      ],
      summaryResponseAttributes: [
        {
          key: "guid",
          label: "Guid",
        },
        {
          key: "glossaryGuid",
          label: "Glossary Guid",
        },
        {
          key: "glossaryName",
          label: "Glossary name",
        },
      ],
    },
    glossary: {
      key: "glossary",
      plural: "glossaries",
      typeName: "Glossary",
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
      summaryResponseAttributes: [
        {
          key: "guid",
          label: "Guid",
        },
      ],
    },
    category: {
      key: "category",
      plural: "categories",
      typeName: "Category",
      hasGlossary: true,
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
      summaryResponseAttributes: [
        {
          key: "guid",
          label: "Guid",
        },
        {
          key: "glossaryGuid",
          label: "Glossary Guid",
        },
        {
          key: "glossaryName",
          label: "Glossary name",
        },
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
  console.log("looking for key " +key);
  let nodeType = nodeTypes[key];

  if (nodeType) {
    nodeType.url =
     GlossaryAuthorURL +
      "/" +
      nodeType.plural;
  } else {
    nodeType = nodeTypes["notSet"];
  }
  return nodeType;
};

export default getNodeType;
