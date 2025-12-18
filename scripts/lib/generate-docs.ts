/**
 * Generate Markdown documentation files from the OXA JSON Schema.
 *
 * Creates individual documentation files for each schema type in the docs/schema/
 * directory, formatted for use in documentation sites.
 */

import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

import { loadMergedSchema } from "./schema.js";

const OUTPUT_DIR = join(import.meta.dirname, "../../docs/schema");

interface SchemaProperty {
  type?: string;
  const?: string;
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

export async function generateDocs(): Promise<void> {
  // Delete and recreate output directory
  try {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, which is fine
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const schema = loadMergedSchema();
  const definitions = schema.definitions as Record<string, SchemaDefinition>;

  // Generate documentation for object types (non-union types)
  for (const [name, def] of Object.entries(definitions)) {
    if (!def.anyOf && def.type === "object") {
      const content = generateDocContent(name, def);
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

function generateDocContent(name: string, def: SchemaDefinition): string {
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

  const required = new Set(def.required || []);

  // Properties
  for (const [propName, prop] of Object.entries(def.properties || {})) {
    // Property header
    if (prop.const) {
      // Const types use italic _string_, with const value in parentheses
      lines.push(`__${propName}__: _string_, ("${prop.const}")`);
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
