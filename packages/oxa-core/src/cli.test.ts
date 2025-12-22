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

describe("oxa validate", () => {
  let tempDir: string;
  let validJsonFile: string;
  let validYamlFile: string;
  let invalidFile: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "oxa-cli-test-"));
    validJsonFile = join(tempDir, "valid.json");
    validYamlFile = join(tempDir, "valid.yaml");
    invalidFile = join(tempDir, "invalid.json");

    writeFileSync(validJsonFile, JSON.stringify(validDocument));
    writeFileSync(validYamlFile, validYaml);
    writeFileSync(invalidFile, '{"type": "Document"}');
  });

  afterAll(() => {
    unlinkSync(validJsonFile);
    unlinkSync(validYamlFile);
    unlinkSync(invalidFile);
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
      expect(result.stderr).toContain("invalid");
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
      expect(result.stderr).toContain("invalid");
    });
  });

  describe("help and version", () => {
    it("--help shows usage", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "--help"]);
      expect(stdout).toContain("CLI for validating OXA documents");
    });

    it("validate --help shows command help", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "validate", "--help"]);
      expect(stdout).toContain("Validate JSON or YAML files");
    });

    it("--version shows version", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "--version"]);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });
});
