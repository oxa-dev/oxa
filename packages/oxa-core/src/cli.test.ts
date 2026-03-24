import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execa } from "execa";
import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, "..", "dist", "cli.js");

// Valid minimal document (only required fields)
const validDocument = {
  type: "Document",
  children: [],
};

const validYaml = `type: Document
children: []
`;

const convertibleDocument = {
  type: "Document",
  title: [{ type: "Text", value: "CLI Example" }],
  metadata: { license: "CC-BY-4.0" },
  children: [
    {
      type: "Paragraph",
      children: [{ type: "Text", value: "Hello from CLI" }],
    },
  ],
};

const convertibleYaml = `type: Document
title:
  - type: Text
    value: CLI Example
metadata:
  license: CC-BY-4.0
children:
  - type: Paragraph
    children:
      - type: Text
        value: Hello from CLI
`;

describe("oxa cli", () => {
  let tempDir: string;
  let validJsonFile: string;
  let validYamlFile: string;
  let invalidFile: string;
  let convertibleJsonFile: string;
  let convertibleYamlFile: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "oxa-cli-test-"));
    validJsonFile = join(tempDir, "valid.json");
    validYamlFile = join(tempDir, "valid.yaml");
    invalidFile = join(tempDir, "invalid.json");
    convertibleJsonFile = join(tempDir, "convert.json");
    convertibleYamlFile = join(tempDir, "convert.yaml");

    writeFileSync(validJsonFile, JSON.stringify(validDocument));
    writeFileSync(validYamlFile, validYaml);
    writeFileSync(invalidFile, '{"type": "Document"}');
    writeFileSync(convertibleJsonFile, JSON.stringify(convertibleDocument));
    writeFileSync(convertibleYamlFile, convertibleYaml);
  });

  afterAll(() => {
    unlinkSync(validJsonFile);
    unlinkSync(validYamlFile);
    unlinkSync(invalidFile);
    unlinkSync(convertibleJsonFile);
    unlinkSync(convertibleYamlFile);
  });

  describe("convert", () => {
    const createdAt = "2026-03-22T00:00:00.000Z";
    const expectedConverted = {
      $type: "dev.oxa.document.document",
      title: {
        text: "CLI Example",
        facets: [],
      },
      metadata: { license: "CC-BY-4.0" },
      children: [
        {
          $type: "dev.oxa.document.defs#paragraph",
          text: "Hello from CLI",
          facets: [],
        },
      ],
      createdAt,
    };

    it("converts JSON from stdin to ATProto JSON with --created-at", async () => {
      const { exitCode, stdout } = await execa(
        "node",
        [CLI_PATH, "convert", "--to", "atproto", "--created-at", createdAt, "-"],
        {
          input: JSON.stringify(convertibleDocument),
        },
      );

      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout)).toEqual(expectedConverted);
    });

    it("converts YAML from stdin with --yaml", async () => {
      const { exitCode, stdout } = await execa(
        "node",
        [CLI_PATH, "convert", "--to", "atproto", "--yaml", "--created-at", createdAt, "-"],
        {
          input: convertibleYaml,
        },
      );

      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout)).toEqual(expectedConverted);
    });

    it("converts a YAML file and exits 0", async () => {
      const { exitCode, stdout } = await execa("node", [
        CLI_PATH,
        "convert",
        "--to",
        "atproto",
        "--created-at",
        createdAt,
        convertibleYamlFile,
      ]);

      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout)).toEqual(expectedConverted);
    });

    it("converts a JSON file and exits 0", async () => {
      const { exitCode, stdout } = await execa("node", [
        CLI_PATH,
        "convert",
        "--to",
        "atproto",
        "--created-at",
        createdAt,
        convertibleJsonFile,
      ]);

      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout)).toEqual(expectedConverted);
    });

    it("exits with error for missing --to option", async () => {
      const result = await execa(
        "node",
        [CLI_PATH, "convert", "--created-at", createdAt, "-"],
        {
          input: JSON.stringify(convertibleDocument),
          reject: false,
        },
      );

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain("--to");
    });

    it("exits with error for unknown --to format", async () => {
      const result = await execa(
        "node",
        [CLI_PATH, "convert", "--to", "unknown", "--created-at", createdAt, "-"],
        {
          input: JSON.stringify(convertibleDocument),
          reject: false,
        },
      );

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain("Unknown format");
    });
  });

  describe("stdin input", () => {
    it("exits 0 for valid JSON from stdin", async () => {
      const { exitCode, stdout } = await execa(
        "node",
        [CLI_PATH, "validate", "-"],
        {
          input: JSON.stringify(validDocument),
        },
      );
      expect(exitCode).toBe(0);
      expect(stdout).toContain("valid");
    });

    it("exits 1 for invalid JSON from stdin", async () => {
      const result = await execa("node", [CLI_PATH, "validate", "-"], {
        input: '{"type": "Document"}',
        reject: false,
      });
      expect(result.exitCode).toBe(1);
      // Non-TTY outputs JSON with valid:false
      expect(result.stderr).toContain('"valid":false');
    });

    it("exits 1 for malformed JSON from stdin", async () => {
      const result = await execa("node", [CLI_PATH, "validate", "-"], {
        input: "{ not valid json",
        reject: false,
      });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Invalid JSON");
    });

    it("validates YAML from stdin with --yaml flag", async () => {
      const { exitCode, stdout } = await execa(
        "node",
        [CLI_PATH, "validate", "--yaml", "-"],
        { input: validYaml },
      );
      expect(exitCode).toBe(0);
      expect(stdout).toContain("valid");
    });

    it("exits 1 for invalid YAML from stdin", async () => {
      const result = await execa(
        "node",
        [CLI_PATH, "validate", "--yaml", "-"],
        {
          input: "type: Document",
          reject: false,
        },
      );
      expect(result.exitCode).toBe(1);
    });
  });

  describe("file input", () => {
    it("validates JSON file", async () => {
      const { exitCode, stdout } = await execa("node", [
        CLI_PATH,
        "validate",
        validJsonFile,
      ]);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("valid");
    });

    it("validates YAML file", async () => {
      const { exitCode, stdout } = await execa("node", [
        CLI_PATH,
        "validate",
        validYamlFile,
      ]);
      expect(exitCode).toBe(0);
      expect(stdout).toContain("valid");
    });

    it("exits 1 for invalid file", async () => {
      const result = await execa("node", [CLI_PATH, "validate", invalidFile], {
        reject: false,
      });
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("invalid");
    });

    it("exits 1 for non-existent file", async () => {
      const result = await execa(
        "node",
        [CLI_PATH, "validate", "/nonexistent/file.json"],
        { reject: false },
      );
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Failed to read file");
    });
  });

  describe("options", () => {
    it("--type validates against specific type", async () => {
      const heading = {
        type: "Heading",
        level: 1,
        children: [{ type: "Text", value: "Title" }],
      };
      const { exitCode } = await execa(
        "node",
        [CLI_PATH, "validate", "--type", "Heading", "-"],
        {
          input: JSON.stringify(heading),
        },
      );
      expect(exitCode).toBe(0);
    });

    it("--type with unknown type exits 1 with error message", async () => {
      const result = await execa(
        "node",
        [CLI_PATH, "validate", "--type", "UnknownType", "-"],
        {
          input: JSON.stringify(validDocument),
          reject: false,
        },
      );
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Unknown type");
      expect(result.stderr).toContain("UnknownType");
    });

    it("--quiet suppresses success output", async () => {
      const { exitCode, stdout } = await execa(
        "node",
        [CLI_PATH, "validate", "-q", "-"],
        { input: JSON.stringify(validDocument) },
      );
      expect(exitCode).toBe(0);
      expect(stdout).toBe("");
    });

    it("--quiet still shows errors", async () => {
      const result = await execa("node", [CLI_PATH, "validate", "-q", "-"], {
        input: '{"type": "Document"}',
        reject: false,
      });
      expect(result.exitCode).toBe(1);
      // Non-TTY outputs JSON with valid:false
      expect(result.stderr).toContain('"valid":false');
    });
  });

  describe("help and version", () => {
    it("--help shows usage", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "--help"]);
      expect(stdout).toContain("CLI for validating OXA documents");
    });

    it("--help lists the convert command", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "--help"]);
      expect(stdout).toContain("convert");
    });

    it("validate --help shows command help", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "validate", "--help"]);
      expect(stdout).toContain("Validate JSON or YAML files");
    });

    it("convert --help shows command help and ATProto options", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "convert", "--help"]);
      expect(stdout).toContain("Convert OXA documents");
      expect(stdout).toContain("--to");
      expect(stdout).toContain("--created-at");
      expect(stdout).toContain("--yaml");
    });

    it("--version shows version", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "--version"]);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });
});
