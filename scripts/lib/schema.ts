/**
 * Load and merge YAML schema files into a single JSON Schema.
 */

import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";
import yaml from "js-yaml";
import { getVersion } from "./version.js";

const SCHEMA_DIR = join(import.meta.dirname, "../../schema");

export interface SchemaFile {
  name: string;
  path: string;
  schema: Record<string, unknown>;
}

/**
 * Load and merge all schemas into a single JSON Schema.
 */
export function loadMergedSchema(): Record<string, unknown> {
  const files = loadSchemaFiles();
  return mergeSchemas(files);
}

/**
 * Load all YAML schema files from the schema directory.
 */
export function loadSchemaFiles(): SchemaFile[] {
  const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith(".yaml"));

  return files.map((file) => {
    const path = join(SCHEMA_DIR, file);
    const content = readFileSync(path, "utf-8");
    const schema = yaml.load(content) as Record<string, unknown>;
    return {
      name: basename(file, ".yaml"),
      path,
      schema,
    };
  });
}

/**
 * Merge all schema files into a single JSON Schema with definitions.
 * Converts relative $ref paths to definition references.
 */
export function mergeSchemas(files: SchemaFile[]): Record<string, unknown> {
  const definitions: Record<string, unknown> = {};

  for (const file of files) {
    const schema = structuredClone(file.schema);
    // Remove top-level $schema and $id from definitions
    delete schema.$schema;
    delete schema.$id;
    definitions[file.name] = schema;
  }

  // Rewrite $ref paths from "./Type.yaml" to "#/definitions/Type"
  const rewriteRefs = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(rewriteRefs);
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "$ref" && typeof value === "string") {
        const match = value.match(/^\.\/(.+)\.yaml$/);
        if (match) {
          result[key] = `#/definitions/${match[1]}`;
        } else {
          result[key] = value;
        }
      } else {
        result[key] = rewriteRefs(value);
      }
    }
    return result;
  };

  const rewrittenDefinitions = rewriteRefs(definitions) as Record<
    string,
    unknown
  >;

  const version = getVersion();

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: `https://oxa.dev/v${version}/schema.json`,
    title: "OXA Schema",
    description: "JSON Schema for OXA document types",
    version,
    definitions: rewrittenDefinitions,
    $ref: "#/definitions/Document",
  };
}
