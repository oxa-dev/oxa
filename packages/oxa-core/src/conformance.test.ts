/**
 * Tests that all OXA conformance test cases validate against the OXA schema.
 *
 * This ensures that:
 * 1. All test cases in the conformance suite are valid OXA documents
 * 2. The test cases stay in sync with schema changes
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import manifest from "@oxa/conformance";
import { validate } from "./validate.js";

// Resolve the path to the conformance package for loading individual test case files
const CONFORMANCE_PATH = dirname(
  fileURLToPath(import.meta.resolve("@oxa/conformance")),
);

interface TestCase {
  title: string;
  category: string;
  formats: {
    oxa: Record<string, unknown>;
  };
}

describe("OXA Conformance Suite", () => {
  describe("manifest", () => {
    it("has valid version", () => {
      expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("has expected formats in canonical order", () => {
      expect(manifest.formats).toEqual([
        "oxa",
        "myst",
        "pandoc",
        "stencila",
        "markdown",
        "html",
        "jats",
      ]);
    });

    it("has at least one test case", () => {
      expect(manifest.cases.length).toBeGreaterThan(0);
    });
  });

  describe("test cases", () => {
    for (const testCaseMeta of manifest.cases) {
      describe(`${testCaseMeta.category}/${testCaseMeta.id}`, () => {
        const casePath = join(CONFORMANCE_PATH, testCaseMeta.path);
        const testCase: TestCase = JSON.parse(readFileSync(casePath, "utf-8"));

        it("has required fields", () => {
          expect(testCase.title).toBeDefined();
          expect(testCase.category).toBeDefined();
          expect(testCase.formats).toBeDefined();
          expect(testCase.formats.oxa).toBeDefined();
        });

        it("category matches manifest", () => {
          expect(testCase.category).toBe(testCaseMeta.category);
        });

        it("OXA format validates against schema", () => {
          // Determine the root type from the OXA content
          const oxa = testCase.formats.oxa;
          const rootType = oxa.type as string;

          const result = validate(oxa, { type: rootType });

          if (!result.valid) {
            // Provide helpful error message
            const errors = result.errors.map((e) => e.message).join("\n  ");
            expect.fail(
              `OXA content failed validation:\n  ${errors}\n\nContent: ${JSON.stringify(oxa, null, 2)}`,
            );
          }

          expect(result.valid).toBe(true);
        });

        it("nodeTypes in manifest match actual types in OXA", () => {
          // Compare as sorted arrays to avoid Set iteration order issues
          const actualTypes = Array.from(extractTypes(testCase.formats.oxa)).sort();
          const manifestTypes = [...testCaseMeta.nodeTypes].sort();

          expect(actualTypes).toEqual(manifestTypes);
        });
      });
    }
  });
});

/**
 * Extract all type values from an OXA node tree.
 */
function extractTypes(node: unknown): Set<string> {
  const types = new Set<string>();

  function walk(n: unknown): void {
    if (n && typeof n === "object" && !Array.isArray(n)) {
      const obj = n as Record<string, unknown>;
      if (typeof obj.type === "string") {
        types.add(obj.type);
      }
      for (const value of Object.values(obj)) {
        walk(value);
      }
    } else if (Array.isArray(n)) {
      for (const item of n) {
        walk(item);
      }
    }
  }

  walk(node);
  return types;
}
