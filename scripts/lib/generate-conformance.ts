/**
 * Generate conformance suite manifest and TypeScript types.
 *
 * - Generates manifest.json from test case files
 * - Generates index.d.ts from JSON schemas
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { compile } from "json-schema-to-typescript";
import prettier from "prettier";

const CONFORMANCE_PATH = join(
  import.meta.dirname,
  "../../packages/oxa-conformance",
);
const CASES_PATH = join(CONFORMANCE_PATH, "cases");
const SCHEMAS_PATH = join(CONFORMANCE_PATH, "schemas");
const MANIFEST_OUTPUT_PATH = join(CONFORMANCE_PATH, "manifest.json");
const TYPES_OUTPUT_PATH = join(CONFORMANCE_PATH, "index.d.ts");

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

/**
 * Generate TypeScript types from JSON schemas.
 */
async function generateTypes(): Promise<void> {
  const testCaseSchema = JSON.parse(
    readFileSync(join(SCHEMAS_PATH, "test-case.schema.json"), "utf-8"),
  );
  const manifestSchema = JSON.parse(
    readFileSync(join(SCHEMAS_PATH, "manifest.schema.json"), "utf-8"),
  );

  // Generate types from schemas
  const testCaseTypes = await compile(testCaseSchema, "TestCase", {
    bannerComment: "",
    additionalProperties: false,
  });

  const manifestTypes = await compile(manifestSchema, "Manifest", {
    bannerComment: "",
    additionalProperties: false,
  });

  // Extract the generated interface names from the output
  // json-schema-to-typescript uses the schema title for the interface name
  const testCaseMatch = testCaseTypes.match(/export interface (\w+)/);
  const manifestMatch = manifestTypes.match(/export interface (\w+)/);
  const testCaseInterfaceName = testCaseMatch?.[1] ?? "TestCase";
  const manifestInterfaceName = manifestMatch?.[1] ?? "Manifest";

  // Combine into a single declaration file with friendly type aliases
  const output = `/**
 * Type declarations for @oxa/conformance
 *
 * AUTO-GENERATED from JSON schemas - do not edit directly.
 * Run \`pnpm codegen conformance\` to regenerate.
 */

${testCaseTypes}

${manifestTypes}

// Friendly type aliases
export type TestCase = ${testCaseInterfaceName};
export type Manifest = ${manifestInterfaceName};
export type ManifestCase = Manifest["cases"][number];

declare const manifest: Manifest;
export default manifest;
`;

  const formatted = await prettier.format(output, {
    parser: "typescript",
    filepath: TYPES_OUTPUT_PATH,
  });

  writeFileSync(TYPES_OUTPUT_PATH, formatted);
  console.log(`Generated ${TYPES_OUTPUT_PATH}`);
}

/**
 * Generate manifest.json from test case files.
 */
async function generateManifest(): Promise<void> {
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
    formats: [
      "oxa",
      "myst-ast",
      "pandoc-types",
      "stencila-schema",
      "markdown",
      "myst-markdown",
      "stencila-markdown",
      "quarto-markdown",
      "html",
      "jats",
    ],
    cases: allCases,
  };

  const json = JSON.stringify(manifest, null, 2);
  const formatted = await prettier.format(json, {
    parser: "json",
    filepath: MANIFEST_OUTPUT_PATH,
  });

  writeFileSync(MANIFEST_OUTPUT_PATH, formatted);
  console.log(
    `Generated ${MANIFEST_OUTPUT_PATH} with ${allCases.length} test cases`,
  );
}

export async function generateConformance(): Promise<void> {
  await generateTypes();
  await generateManifest();
}
