import yaml from "js-yaml";
import {
  validate as oxaValidate,
  validateJson as oxaValidateJson,
  type ValidationResult as OxaValidationResult,
} from "@oxa/core";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

function fromOxaResult(result: OxaValidationResult): ValidationResult {
  if (result.valid) return { valid: true };
  return {
    valid: false,
    errors: result.errors.map((e) => e.message),
  };
}

export function validate(
  source: string,
  format: "json" | "yaml",
): ValidationResult {
  try {
    if (format === "json") {
      return fromOxaResult(oxaValidateJson(source));
    }
    const data = yaml.load(source);
    return fromOxaResult(oxaValidate(data));
  } catch (e) {
    return { valid: false, errors: [String(e)] };
  }
}
