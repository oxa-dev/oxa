/**
 * Validation functions for OXA documents.
 *
 * This module is browser-safe — it does not import Node.js modules.
 * The schema is bundled directly via JSON import.
 */

import AjvDefault from "ajv";
import addFormatsDefault from "ajv-formats";
import type { ValidateFunction, ErrorObject } from "ajv";
// @ts-expect-error - better-ajv-errors has broken TypeScript exports
import betterAjvErrors from "better-ajv-errors";
import yaml from "js-yaml";
import schemaData from "./schema.json" with { type: "json" };

// Handle CJS/ESM interop - these packages don't have proper ESM types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv = AjvDefault as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFormats = addFormatsDefault as any;

const schema: Record<string, unknown> = schemaData as Record<string, unknown>;

/**
 * Result of validating a document.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  /** Pretty-printed output for terminal display (only present with format: 'cli') */
  prettyOutput?: string;
}

/**
 * Location in source file.
 */
export interface SourceLocation {
  line: number;
  column: number;
  offset: number;
}

/**
 * A validation error with location information.
 */
export interface ValidationError {
  path: string;
  message: string;
  suggestion?: string;
  start?: SourceLocation;
  end?: SourceLocation;
}

/**
 * Options for validation.
 */
export interface ValidateOptions {
  /** Validate against a specific definition instead of Document */
  type?: string;
  /** Raw JSON string for accurate line/column positions in errors */
  json?: string;
  /** Output format: 'js' for structured errors, 'cli' for pretty terminal output */
  format?: "js" | "cli";
}

// Cached validator instances
const validatorCache = new Map<string, ValidateFunction>();

/**
 * Get available type names from the schema definitions.
 */
export function getTypeNames(): string[] {
  const definitions = schema.definitions as Record<string, unknown>;
  return Object.keys(definitions);
}

/**
 * Get or create the AJV validator instance.
 * Returns null if the type is not found in the schema.
 */
function getValidator(type?: string): ValidateFunction | null {
  const cacheKey = type || "__default__";

  if (validatorCache.has(cacheKey)) {
    return validatorCache.get(cacheKey)!;
  }

  // Validate that the type exists in definitions
  if (type) {
    const definitions = schema.definitions as Record<string, unknown>;
    if (!definitions || !(type in definitions)) {
      return null;
    }
  }

  const ajv = new Ajv({
    strict: true,
    allErrors: true,
  });
  addFormats(ajv);

  // Allow custom 'version' keyword in strict mode
  ajv.addKeyword("version");

  const schemaWithRef = type
    ? { ...schemaData, $ref: `#/definitions/${type}` }
    : schemaData;

  const validator = ajv.compile(schemaWithRef);
  validatorCache.set(cacheKey, validator);

  return validator;
}

interface BetterError {
  path?: string;
  error?: string;
  suggestion?: string;
  start?: SourceLocation;
  end?: SourceLocation;
}

/**
 * Convert AJV errors to ValidationError format using better-ajv-errors.
 * Returns both structured errors and optionally pretty CLI output.
 */
function formatErrors(
  errors: ErrorObject[] | null | undefined,
  schema: Record<string, unknown>,
  data: unknown,
  json?: string,
  format: "js" | "cli" = "js",
): { errors: ValidationError[]; prettyOutput?: string } {
  if (!errors || errors.length === 0) {
    return { errors: [] };
  }

  // Get structured errors for the errors array
  const structuredErrors = betterAjvErrors(schema, data, errors, {
    format: "js",
    json,
  }) as BetterError[] | null;

  const validationErrors = (structuredErrors ?? []).map((err: BetterError) => ({
    path: err.path ?? "/",
    message: err.error ?? "Unknown error",
    suggestion: err.suggestion,
    start: err.start,
    end: err.end,
  }));

  // Get pretty CLI output if requested
  let prettyOutput: string | undefined;
  if (format === "cli") {
    prettyOutput = betterAjvErrors(schema, data, errors, {
      format: "cli",
      json,
    }) as string;
  }

  return { errors: validationErrors, prettyOutput };
}

/**
 * Validate a parsed document object against the OXA schema.
 */
export function validate(
  data: unknown,
  options: ValidateOptions = {},
): ValidationResult {
  const validator = getValidator(options.type);
  // Unknown type specified
  if (!validator) {
    const availableTypes = getTypeNames().join(", ");
    return {
      valid: false,
      errors: [
        {
          path: "/",
          message: `Unknown type "${options.type}". Available types: ${availableTypes}`,
        },
      ],
    };
  }

  const valid = validator(data);
  const { errors, prettyOutput } = formatErrors(
    validator.errors,
    schema,
    data,
    options.json,
    options.format,
  );

  return {
    valid: valid as boolean,
    errors,
    prettyOutput,
  };
}

/**
 * Validate a JSON string against the OXA schema.
 */
export function validateJson(
  json: string | Record<string, unknown>,
  options: ValidateOptions = {},
): ValidationResult {
  try {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return validate(data, {
      ...options,
      json: typeof json === "string" ? json : undefined,
    });
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: "/",
          message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Validate a YAML string against the OXA schema.
 */
export function validateYaml(
  yamlContent: string,
  options: ValidateOptions = {},
): ValidationResult {
  try {
    const data = yaml.load(yamlContent);
    return validate(data, options);
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: "/",
          message: `Invalid YAML: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Get the loaded OXA schema.
 */
export function getSchema(): Record<string, unknown> {
  return structuredClone(schema);
}
