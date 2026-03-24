import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  validateFile,
  validateContent,
  parseFile,
  parseDocumentText,
  isYamlFilePath,
} from "./validate-file.js";

const validDocument = {
  type: "Document",
  children: [],
};

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
    expect(result.errors[0].message).toContain("Failed to read file");
  });
});

describe("validateContent", () => {
  it("validates JSON content", () => {
    const result = validateContent(JSON.stringify(validDocument), {}, "js");
    expect(result.valid).toBe(true);
  });

  it("validates YAML content", () => {
    const result = validateContent(
      "type: Document\nchildren: []\n",
      { yaml: true },
      "js",
    );
    expect(result.valid).toBe(true);
  });

  it("returns errors for invalid content", () => {
    const result = validateContent('{"type": "Document"}', {}, "js");
    expect(result.valid).toBe(false);
  });
});

describe("parseFile", () => {
  let tempDir: string;
  let jsonFile: string;
  let yamlFile: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "oxa-parse-test-"));
    jsonFile = join(tempDir, "doc.json");
    yamlFile = join(tempDir, "doc.yaml");

    writeFileSync(jsonFile, JSON.stringify(validDocument));
    writeFileSync(yamlFile, "type: Document\nchildren: []\n");
  });

  afterAll(() => {
    unlinkSync(jsonFile);
    unlinkSync(yamlFile);
  });

  it("parses a JSON file", () => {
    const result = parseFile(jsonFile);
    expect(result).toEqual(validDocument);
  });

  it("parses a YAML file", () => {
    const result = parseFile(yamlFile);
    expect(result).toEqual(validDocument);
  });
});

describe("parseDocumentText", () => {
  it("parses JSON text", () => {
    const result = parseDocumentText('{"type": "Document"}', false);
    expect(result).toEqual({ type: "Document" });
  });

  it("parses YAML text", () => {
    const result = parseDocumentText("type: Document\n", true);
    expect(result).toEqual({ type: "Document" });
  });
});

describe("isYamlFilePath", () => {
  it("returns true for .yaml", () => {
    expect(isYamlFilePath("doc.yaml")).toBe(true);
  });

  it("returns true for .yml", () => {
    expect(isYamlFilePath("doc.yml")).toBe(true);
  });

  it("returns false for .json", () => {
    expect(isYamlFilePath("doc.json")).toBe(false);
  });
});
