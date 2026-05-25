import { describe, it, expect } from "vitest";
import {
  validate,
  validateJson,
  validateYaml,
  getSchema,
  getTypeNames,
} from "./validate.js";

// Valid minimal document (only required fields)
const validDocument = {
  type: "Document",
  children: [],
};

// Valid document with content (using minimal nested objects)
const validDocumentWithContent = {
  type: "Document",
  metadata: { author: "Test" },
  title: [{ type: "Text", value: "Test Document" }],
  children: [
    {
      type: "Paragraph",
      children: [{ type: "Text", value: "Hello world" }],
    },
  ],
};

const validDocumentWithCitations = {
  type: "Document",
  children: [
    {
      type: "Paragraph",
      children: [
        { type: "Text", value: "Prior work " },
        {
          type: "CiteGroup",
          kind: "parenthetical",
          children: [
            {
              type: "Cite",
              xref: "jones2022",
              prefix: [{ type: "Text", value: "see " }],
              locator: "fig. 3",
              intent: "extends",
            },
            { type: "Cite", xref: "smith2021", display: "author" },
          ],
        },
        { type: "Text", value: " is relevant." },
      ],
    },
    {
      type: "Reference",
      id: "jones2022",
      children: [{ type: "Text", value: "Jones and Chen (2022)." }],
      csl: {
        id: "jones2022",
        "citation-key": "jones2022",
        type: "article-journal",
        title: "A Framework for Open Science",
      },
    },
    {
      type: "Reference",
      id: "smith2021",
      csl: {
        id: "smith2021",
        "citation-key": "smith2021",
        type: "article-journal",
        title: "Related Work",
      },
    },
  ],
};

describe("validate", () => {
  it("returns valid for correct Document", () => {
    const result = validate(validDocument);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid for Document with content", () => {
    const result = validate(validDocumentWithContent);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid for Document with citations and references", () => {
    const result = validate(validDocumentWithCitations);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates Cite against its specific type", () => {
    const result = validate(
      {
        type: "Cite",
        xref: "jones2022",
        display: "date",
      },
      { type: "Cite" },
    );
    expect(result.valid).toBe(true);
  });

  it("rejects invalid Cite display values", () => {
    const result = validate(
      {
        type: "Cite",
        xref: "jones2022",
        display: "invalid",
      },
      { type: "Cite" },
    );
    expect(result.valid).toBe(false);
  });

  it("rejects empty CiteGroup children", () => {
    const result = validate(
      {
        type: "CiteGroup",
        kind: "parenthetical",
        children: [],
      },
      { type: "CiteGroup" },
    );
    expect(result.valid).toBe(false);
  });

  it("requires Reference csl data and id", () => {
    const result = validate(
      {
        type: "Reference",
        csl: {
          id: "jones2022",
          type: "article-journal",
        },
      },
      { type: "Reference" },
    );
    expect(result.valid).toBe(false);
  });

  it("rejects Cite xrefs without a matching Reference id", () => {
    const result = validate({
      type: "Document",
      children: [
        {
          type: "Paragraph",
          children: [{ type: "Cite", xref: "missing2024" }],
        },
        {
          type: "Reference",
          id: "jones2022",
          csl: {
            id: "jones2022",
            "citation-key": "jones2022",
            type: "article-journal",
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("missing2024");
  });

  it("rejects Reference ids that do not match csl citation keys", () => {
    const result = validate(
      {
        type: "Reference",
        id: "jones2022",
        csl: {
          id: "jones2022",
          "citation-key": "smith2021",
          type: "article-journal",
        },
      },
      { type: "Reference" },
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe("/csl/citation-key");
  });

  it("rejects duplicate Reference ids in documents", () => {
    const result = validate({
      type: "Document",
      children: [
        {
          type: "Reference",
          id: "jones2022",
          csl: {
            id: "jones2022",
            "citation-key": "jones2022",
            type: "article-journal",
          },
        },
        {
          type: "Reference",
          id: "jones2022",
          csl: {
            id: "jones2022",
            "citation-key": "jones2022",
            type: "article-journal",
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("Duplicate Reference id");
  });

  it("returns errors for missing required fields", () => {
    const result = validate({ type: "Document" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.message.includes("children"))).toBe(
      true,
    );
  });

  it("returns errors for wrong type", () => {
    const result = validate({ type: "Invalid" });
    expect(result.valid).toBe(false);
  });

  it("returns errors for invalid nested content", () => {
    const result = validate({
      ...validDocument,
      children: [{ type: "InvalidBlock" }],
    });
    expect(result.valid).toBe(false);
  });

  it("validates against specific type with options.type", () => {
    const heading = {
      type: "Heading",
      level: 1,
      children: [{ type: "Text", value: "Title" }],
    };
    const result = validate(heading, { type: "Heading" });
    expect(result.valid).toBe(true);
  });

  it("rejects invalid type when using options.type", () => {
    const result = validate(validDocument, { type: "Heading" });
    expect(result.valid).toBe(false);
  });

  it("returns validation error for unknown type", () => {
    const result = validate(validDocument, { type: "UnknownType" });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("Unknown type");
    expect(result.errors[0].message).toContain("UnknownType");
    expect(result.errors[0].message).toContain("Available types");
  });
});

describe("validateJson", () => {
  it("returns valid for correct JSON", () => {
    const result = validateJson(JSON.stringify(validDocument));
    expect(result.valid).toBe(true);
  });

  it("returns errors for invalid JSON syntax", () => {
    const result = validateJson("{ invalid json }");
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("Invalid JSON");
  });

  it("returns errors for valid JSON but invalid document", () => {
    const result = validateJson('{"type": "Document"}');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validateYaml", () => {
  it("returns valid for correct YAML", () => {
    const yaml = `
type: Document
children: []
`;
    const result = validateYaml(yaml);
    expect(result.valid).toBe(true);
  });

  it("returns errors for invalid YAML syntax", () => {
    const result = validateYaml("invalid: yaml: syntax:");
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("Invalid YAML");
  });

  it("returns errors for valid YAML but invalid document", () => {
    const result = validateYaml("type: Document");
    expect(result.valid).toBe(false);
  });
});

describe("getSchema", () => {
  it("returns the OXA schema", () => {
    const schema = getSchema();
    expect(schema).toHaveProperty("$schema");
    expect(schema).toHaveProperty("definitions");
    expect(schema.$id).toContain("oxa.dev");
  });

  it("returns a clone (not the original)", () => {
    const schema1 = getSchema();
    const schema2 = getSchema();
    expect(schema1).not.toBe(schema2);
    expect(schema1).toEqual(schema2);
  });
});

describe("getTypeNames", () => {
  it("returns available type names", () => {
    const types = getTypeNames();
    expect(types).toContain("Cite");
    expect(types).toContain("CiteGroup");
    expect(types).toContain("Document");
    expect(types).toContain("Heading");
    expect(types).toContain("Paragraph");
    expect(types).toContain("Reference");
    expect(types).toContain("Text");
  });
});
