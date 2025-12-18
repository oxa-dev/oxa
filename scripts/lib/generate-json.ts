/**
 * Generate consolidated JSON Schema from YAML schema files.
 *
 * Merges individual YAML schema definitions into a single JSON Schema file.
 * This allows us to serve an official JSON Schema document, enables
 * compatibility with tools that lack YAML support, submission to the JSON
 * Schema Store, and integration with the oxa CLI.
 */

import { writeFileSync } from "fs";
import { join } from "path";
import prettier from "prettier";
import { loadMergedSchema } from "./schema.js";

const OUTPUT_PATH = join(import.meta.dirname, "../../schema/schema.json");

export async function generateJson(): Promise<void> {
  const schema = loadMergedSchema();
  const json = JSON.stringify(schema, null, 2);
  const formatted = await prettier.format(json, {
    parser: "json",
    filepath: OUTPUT_PATH,
  });
  writeFileSync(OUTPUT_PATH, formatted);
  console.log(`Generated ${OUTPUT_PATH}`);
}
