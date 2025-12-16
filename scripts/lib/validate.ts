/**
 * Validate that the schema files are valid JSON Schema.
 */

import AjvDefault from "ajv";
import addFormatsDefault from "ajv-formats";
import { loadMergedSchema, loadSchemaFiles } from "./schema.js";

// Handle CJS/ESM interop - these packages don't have proper ESM types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv = AjvDefault as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = addFormatsDefault as any;

/**
 * Validate that all schema files are valid JSON Schema draft-07.
 */
export async function validateSchemas(): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Load individual files to check for syntax errors
  try {
    const files = loadSchemaFiles();
    console.log(`Loaded ${files.length} schema files`);
  } catch (error) {
    errors.push(`Failed to load schema files: ${error}`);
    return { valid: false, errors };
  }

  // Load merged schema
  let merged: Record<string, unknown>;
  try {
    merged = loadMergedSchema();
    console.log(
      `Merged schema has ${Object.keys(merged.definitions as object).length} definitions`
    );
  } catch (error) {
    errors.push(`Failed to merge schemas: ${error}`);
    return { valid: false, errors };
  }

  // Validate with Ajv
  const ajv = new Ajv({
    strict: true,
    allErrors: true,
  });
  addFormats(ajv);

  try {
    ajv.compile(merged);
    console.log("Schema is valid JSON Schema");
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Schema validation failed: ${error.message}`);
    } else {
      errors.push(`Schema validation failed: ${error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
