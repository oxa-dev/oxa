/**
 * Generate Markdown documentation files from the OXA JSON Schema.
 *
 * Creates individual documentation files for each schema type in the docs/schema/
 * directory, formatted for use in documentation sites.
 */

import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

import { loadMergedSchema } from "./schema.js";

const OUTPUT_DIR = join(import.meta.dirname, "../../docs/schema");
const INDEX_FILE = join(OUTPUT_DIR, "index.md");
const CONFORMANCE_DIR = join(
  import.meta.dirname,
  "../../packages/oxa-conformance",
);
const MANIFEST_FILE = join(CONFORMANCE_DIR, "manifest.json");

interface SchemaProperty {
  type?: string;
  const?: string;
  enum?: string[];
  description?: string;
  items?: { $ref?: string; type?: string };
  $ref?: string;
  minimum?: number;
  maximum?: number;
  additionalProperties?: boolean;
}

interface SchemaDefinition {
  title: string;
  description?: string;
  type?: string;
  anyOf?: Array<{ $ref: string }>;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

interface TestCase {
  formats: Record<string, unknown>;
}

interface ManifestCase {
  id: string;
  path: string;
  nodeTypes: string[];
}

interface Manifest {
  formats: string[];
  cases: ManifestCase[];
}

export async function generateDocs(): Promise<void> {
  // Preserve index.md if it exists
  let indexContent: string | null = null;
  if (existsSync(INDEX_FILE)) {
    indexContent = readFileSync(INDEX_FILE, "utf-8");
  }

  // Delete and recreate output directory
  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Restore index.md if it was preserved
  if (indexContent !== null) {
    writeFileSync(INDEX_FILE, indexContent);
  }

  const schema = loadMergedSchema();
  const definitions = schema.definitions as Record<string, SchemaDefinition>;
  const { manifest, cases } = loadConformanceData();
  const testCases = loadTestCases(manifest, cases);

  // Generate documentation for object types (non-union types)
  for (const [name, def] of Object.entries(definitions)) {
    if (!def.anyOf && def.type === "object") {
      const content = generateDocContent(name, def, testCases, manifest);
      const filePath = join(OUTPUT_DIR, `${name.toLowerCase()}.md`);
      writeFileSync(filePath, content);
      console.log(`Generated ${filePath}`);
    }
  }

  // Generate documentation for union types
  for (const [name, def] of Object.entries(definitions)) {
    if (def.anyOf) {
      const content = generateUnionDocContent(name, def);
      const filePath = join(OUTPUT_DIR, `${name.toLowerCase()}.md`);
      writeFileSync(filePath, content);
      console.log(`Generated ${filePath}`);
    }
  }
}

function generateDocContent(
  name: string,
  def: SchemaDefinition,
  testCases: Map<string, TestCase>,
  manifest: Manifest,
): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push(`(oxa:${name.toLowerCase()})=`);
  lines.push("");

  // Heading
  lines.push(`## ${name}`);
  lines.push("");
  lines.push("");

  // Description
  if (def.description) {
    lines.push(def.description);
    lines.push("");
    lines.push("");
  }

  // Properties
  for (const [propName, prop] of Object.entries(def.properties || {})) {
    // Property header
    if (prop.const) {
      // Const types use italic _string_, with const value in parentheses
      lines.push(`__${propName}__: _string_, ("${prop.const}")`);
    } else if (prop.enum && prop.enum.length === 1) {
      // Single-element enum (same as const)
      lines.push(`__${propName}__: _string_, ("${prop.enum[0]}")`);
    } else if (prop.enum && prop.enum.length > 1) {
      lines.push(
        `__${propName}__: _string_, (${prop.enum.map((value) => `"${value}"`).join(" | ")})`,
      );
    } else if (prop.type === "array" && prop.items) {
      const arrayType = getArrayItemType(prop.items);
      lines.push(`__${propName}__: __array__ ("${arrayType}")`);
    } else {
      const propType = getPropertyType(prop);
      lines.push(`__${propName}__: __${propType}__`);
    }
    lines.push("");

    // Property description
    if (prop.description) {
      lines.push(`: ${prop.description}`);
    }

    // Reference hint for ref types (arrays with ref items get the hint)
    if (prop.items?.$ref) {
      const refName = prop.items.$ref.replace("#/definitions/", "");
      lines.push(`: See @oxa:${refName.toLowerCase()}`);
    }

    lines.push("");
  }

  // Add test case example if available
  const testCase = testCases.get(name.toLowerCase());
  if (testCase) {
    lines.push(generateTestCaseSection(testCase, manifest));
  }

  return lines.join("\n");
}

function getPropertyType(prop: SchemaProperty): string {
  if (prop.$ref) {
    const refName = prop.$ref.replace("#/definitions/", "");
    return refName;
  }

  switch (prop.type) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "unknown";
  }
}

function generateUnionDocContent(name: string, def: SchemaDefinition): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push(`(oxa:${name.toLowerCase()})=`);
  lines.push("");

  // Heading
  lines.push(`## ${name}`);
  lines.push("");
  lines.push("");

  // Description
  if (def.description) {
    lines.push(def.description);
    lines.push("");
    lines.push("");
  }

  // List union members
  const members =
    def.anyOf?.map((item) => {
      const ref = item.$ref;
      const typeName = ref?.replace("#/definitions/", "") || "unknown";
      return typeName;
    }) || [];

  if (members.length > 0) {
    lines.push(
      `Union of: ${members.map((m) => `@oxa:${m.toLowerCase()}`).join(", ")}`,
    );
    lines.push("");
  }

  return lines.join("\n");
}

function getArrayItemType(items: { $ref?: string; type?: string }): string {
  if (items.$ref) {
    return items.$ref.replace("#/definitions/", "");
  }
  if (items.type) {
    return items.type;
  }
  return "unknown";
}

function loadConformanceData(): {
  manifest: Manifest;
  cases: Record<string, TestCase>;
} {
  const manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8")) as Manifest;
  const cases = Object.fromEntries(
    manifest.cases.map((caseInfo) => [
      caseInfo.id,
      JSON.parse(
        readFileSync(join(CONFORMANCE_DIR, caseInfo.path), "utf-8"),
      ) as TestCase,
    ]),
  );

  return { manifest, cases };
}

function loadTestCases(
  manifest: Manifest,
  cases: Record<string, TestCase>,
): Map<string, TestCase> {
  const testCases = new Map<string, TestCase>();

  // Filter for *-basic test cases
  for (const caseInfo of manifest.cases) {
    if (!caseInfo.id.endsWith("-basic")) continue;

    // Primary node type is first in nodeTypes array
    const primaryType = caseInfo.nodeTypes[0];
    if (!primaryType) continue;

    const testCase = cases[caseInfo.id];
    testCases.set(primaryType.toLowerCase(), testCase);
  }

  return testCases;
}

const FORMAT_LABELS: Record<string, string> = {
  oxa: "OXA",
  "myst-ast": "MyST AST",
  "pandoc-types": "Pandoc Types",
  "stencila-schema": "Stencila Schema",
  markdown: "Markdown",
  "myst-markdown": "MyST Markdown",
  "stencila-markdown": "Stencila Markdown",
  "quarto-markdown": "Quarto Markdown",
  html: "HTML",
  jats: "JATS",
};

const FORMAT_LANGUAGES: Record<string, string> = {
  oxa: "json",
  "myst-ast": "json",
  "pandoc-types": "json",
  "stencila-schema": "json",
  markdown: "markdown",
  "myst-markdown": "markdown",
  "stencila-markdown": "markdown",
  "quarto-markdown": "markdown",
  html: "html",
  jats: "xml",
};

function generateTestCaseSection(
  testCase: TestCase,
  manifest: Manifest,
): string {
  const lines: string[] = [];

  lines.push("### Example");
  lines.push("");
  lines.push("`````{tab-set}");

  for (const format of manifest.formats) {
    const value = testCase.formats[format as keyof typeof testCase.formats];
    if (value === undefined) continue;

    const label = FORMAT_LABELS[format];
    const lang = FORMAT_LANGUAGES[format];
    const content = typeof value === "string" ? value : JSON.stringify(value);

    lines.push(`\`\`\`\`{tab-item} ${label}`);
    lines.push(`:sync: ${format}`);
    lines.push(`\`\`\`${lang}`);
    lines.push(content);
    lines.push("```");
    lines.push("````");
    lines.push("");
  }

  lines.push("`````");

  return lines.join("\n");
}
