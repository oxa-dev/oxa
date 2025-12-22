/**
 * OXA Core - Validation library and types for OXA documents.
 *
 * @example
 * ```typescript
 * import { validate, validateFile, Document } from "@oxa/core";
 *
 * // Validate a document object
 * const result = validate(myDocument);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 *
 * // Validate a file
 * const fileResult = validateFile("./document.json");
 * ```
 */

// Re-export all types from oxa-types (types-only package)
export type * from "oxa-types";

// Export validation functions and types
export {
  validate,
  validateJson,
  validateYaml,
  validateFile,
  getSchema,
  getTypeNames,
  type ValidationResult,
  type ValidationError,
  type ValidateOptions,
} from "./validate.js";
