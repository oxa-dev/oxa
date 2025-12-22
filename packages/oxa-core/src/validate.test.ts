import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  validate,
  validateJson,
  validateYaml,
  validateFile,
  getSchema,
  getTypeNames,
} from "./validate.js";

// Valid minimal document
const validDocument = {
  type: "Document",
  metadata: {},
  title: [{ type: "Text", value: "Hello", classes: [], data: {} }],
  children: [],
};

// Valid document with content
const validDocumentWithContent = {
  type: "Document",
  metadata: { author: "Test" },
  title: [{ type: "Text", value: "Test Document", classes: [], data: {} }],
  children: [
    {
      type: "Paragraph",
      classes: [],
      data: {},
      children: [{ type: "Text", value: "Hello world", classes: [], data: {} }],
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

  it("returns errors for missing required fields", () => {
    const result = validate({ type: "Document" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.message.includes("title"))).toBe(true);
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
      classes: [],
      data: {},
      children: [{ type: "Text", value: "Title", classes: [], data: {} }],
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
    expect(result.errors[0].keyword).toBe("type");
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
    expect(result.errors[0].keyword).toBe("parse");
    expect(result.errors[0].message).toContain("Invalid JSON");
  });

  it("returns errors for valid JSON but invalid document", () => {
    const result = validateJson('{"type": "Document"}');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.keyword === "required")).toBe(true);
  });
});

describe("validateYaml", () => {
  it("returns valid for correct YAML", () => {
    const yaml = `
type: Document
metadata: {}
title:
  - type: Text
    value: Hello
    classes: []
    data: {}
children: []
`;
    const result = validateYaml(yaml);
    expect(result.valid).toBe(true);
  });

  it("returns errors for invalid YAML syntax", () => {
    const result = validateYaml("invalid: yaml: syntax:");
    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("parse");
    expect(result.errors[0].message).toContain("Invalid YAML");
  });

  it("returns errors for valid YAML but invalid document", () => {
    const result = validateYaml("type: Document");
    expect(result.valid).toBe(false);
  });
});

describe("validateFile", () => {
  let tempDir: string;
  let jsonFile: string;
  let yamlFile: string;
  let invalidFile: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "oxa-test-"));
    jsonFile = join(tempDir, "valid.json");
    yamlFile = join(tempDir, "valid.yaml");
    invalidFile = join(tempDir, "invalid.json");

    writeFileSync(jsonFile, JSON.stringify(validDocument));
    writeFileSync(
      yamlFile,
      `type: Document
metadata: {}
title:
  - type: Text
    value: Hello
    classes: []
    data: {}
children: []
`,
    );
    writeFileSync(invalidFile, '{"type": "Document"}');
  });

  afterAll(() => {
    unlinkSync(jsonFile);
    unlinkSync(yamlFile);
    unlinkSync(invalidFile);
  });

  it("validates JSON file", () => {
    const result = validateFile(jsonFile);
    expect(result.valid).toBe(true);
  });

  it("validates YAML file", () => {
    const result = validateFile(yamlFile);
    expect(result.valid).toBe(true);
  });

  it("returns errors for invalid file content", () => {
    const result = validateFile(invalidFile);
    expect(result.valid).toBe(false);
  });

  it("returns error for non-existent file", () => {
    const result = validateFile("/nonexistent/file.json");
    expect(result.valid).toBe(false);
    expect(result.errors[0].keyword).toBe("file");
    expect(result.errors[0].message).toContain("Failed to read file");
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
    expect(types).toContain("Document");
    expect(types).toContain("Heading");
    expect(types).toContain("Paragraph");
    expect(types).toContain("Text");
  });
});
