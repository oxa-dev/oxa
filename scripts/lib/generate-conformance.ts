/**
 * Generate conformance suite manifest from test case files.
 *
 * Scans the cases directory and generates manifest.json with metadata
 * about all test cases.
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import prettier from "prettier";

const CONFORMANCE_PATH = join(
  import.meta.dirname,
  "../../packages/oxa-conformance",
);
const CASES_PATH = join(CONFORMANCE_PATH, "cases");
const OUTPUT_PATH = join(CONFORMANCE_PATH, "manifest.json");

interface TestCase {
  title: string;
  category: string;
  formats: {
    oxa: Record<string, unknown>;
  };
}

interface ManifestCase {
  id: string;
  path: string;
  category: string;
  nodeTypes: string[];
}

interface Manifest {
  $schema: string;
  version: string;
  formats: string[];
  cases: ManifestCase[];
}

/**
 * Extract OXA node types from a test case's oxa format.
 */
function extractNodeTypes(oxa: Record<string, unknown>): string[] {
  const types = new Set<string>();

  function walk(node: unknown): void {
    if (node && typeof node === "object" && !Array.isArray(node)) {
      const obj = node as Record<string, unknown>;
      if (typeof obj.type === "string") {
        types.add(obj.type);
      }
      for (const value of Object.values(obj)) {
        walk(value);
      }
    } else if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
      }
    }
  }

  walk(oxa);
  return Array.from(types).sort();
}

/**
 * Scan a category directory for test case files.
 * Validates that each test case's declared category matches its folder location.
 */
function scanCategory(category: string): ManifestCase[] {
  const categoryPath = join(CASES_PATH, category);
  const cases: ManifestCase[] = [];

  let files: string[];
  try {
    files = readdirSync(categoryPath).filter((f) => f.endsWith(".json"));
  } catch {
    // Directory doesn't exist yet
    return cases;
  }

  for (const file of files) {
    const filePath = join(categoryPath, file);
    const content = readFileSync(filePath, "utf-8");
    const testCase = JSON.parse(content) as TestCase;

    // Validate category matches folder location
    if (testCase.category !== category) {
      throw new Error(
        `Category mismatch in ${filePath}: ` +
          `file declares "${testCase.category}" but is located in "${category}/" folder. ` +
          `Move the file or update the category field.`,
      );
    }

    const id = basename(file, ".json");
    const nodeTypes = extractNodeTypes(testCase.formats.oxa);

    cases.push({
      id,
      path: `cases/${category}/${file}`,
      category,
      nodeTypes,
    });
  }

  return cases;
}

export async function generateConformance(): Promise<void> {
  // Get version from oxa-conformance package.json
  const pkgPath = join(CONFORMANCE_PATH, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const version = pkg.version;

  // Scan all category directories
  const categories = ["inline", "block", "document"];
  const allCases: ManifestCase[] = [];

  for (const category of categories) {
    const cases = scanCategory(category);
    allCases.push(...cases);
  }

  // Sort cases by category then id for deterministic output
  allCases.sort((a, b) => {
    if (a.category !== b.category) {
      return categories.indexOf(a.category) - categories.indexOf(b.category);
    }
    return a.id.localeCompare(b.id);
  });

  const manifest: Manifest = {
    $schema: "./schemas/manifest.schema.json",
    version,
    formats: ["oxa", "myst", "pandoc", "stencila", "markdown", "html", "jats"],
    cases: allCases,
  };

  const json = JSON.stringify(manifest, null, 2);
  const formatted = await prettier.format(json, {
    parser: "json",
    filepath: OUTPUT_PATH,
  });

  writeFileSync(OUTPUT_PATH, formatted);
  console.log(`Generated ${OUTPUT_PATH} with ${allCases.length} test cases`);
}
