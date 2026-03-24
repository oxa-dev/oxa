/**
 * File-based validation and parsing utilities (Node.js only).
 */

import { readFileSync } from "fs";
import yaml from "js-yaml";
import {
  validateJson,
  validateYaml,
  type ValidationResult,
  type ValidateOptions,
} from "@oxa/core";

const yamlFileExtensions = [".yaml", ".yml"] as const;

export function isYamlFilePath(filePath: string): boolean {
  return yamlFileExtensions.some((extension) => filePath.endsWith(extension));
}

export function parseDocumentText(
  content: string,
  isYaml: boolean,
): unknown {
  return isYaml ? yaml.load(content) : JSON.parse(content);
}

export function parseFile(filePath: string): unknown {
  const content = readFileSync(filePath, "utf-8");
  return parseDocumentText(content, isYamlFilePath(filePath));
}

export function validateFile(
  filePath: string,
  options: ValidateOptions = {},
): ValidationResult {
  try {
    const content = readFileSync(filePath, "utf-8");

    if (isYamlFilePath(filePath)) {
      return validateYaml(content, options);
    } else {
      return validateJson(content, options);
    }
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: "/",
          message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

export function validateContent(
  content: string,
  options: { type?: string; yaml?: boolean },
  format: "cli" | "js",
): ValidationResult {
  return options.yaml
    ? validateYaml(content, { type: options.type, format })
    : validateJson(content, { type: options.type, format });
}
