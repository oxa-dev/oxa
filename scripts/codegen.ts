#!/usr/bin/env node
/**
 * OXA Code Generation CLI
 *
 * Validates schemas and generates types for TypeScript, Python, and Rust.
 */

import { program } from "commander";
import { generateJson } from "./lib/generate-json.js";
import { generateTs } from "./lib/generate-ts.js";
import { generateDocs } from "./lib/generate-docs.js";
import { validateSchemas } from "./lib/validate.js";

interface Generator {
  name: string;
  label: string;
  fn: () => Promise<void>;
}

const generators: Generator[] = [
  { name: "json", label: "JSON Schema", fn: generateJson },
  { name: "ts", label: "TypeScript types", fn: generateTs },
  { name: "docs", label: "Schema documentation", fn: generateDocs },
];

async function validate(): Promise<void> {
  const result = await validateSchemas();
  if (!result.valid) {
    console.error("Validation failed:");
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
  console.log("All schemas are valid!");
}

program
  .name("codegen")
  .description("OXA schema validation and code generation")
  .version("0.1.0");

program
  .command("validate")
  .description("Validate schema files are valid JSON Schema")
  .action(validate);

for (const gen of generators) {
  program.command(gen.name).description(`Generate ${gen.label}`).action(gen.fn);
}

program
  .command("all")
  .description("Run validation and generate all outputs")
  .action(async () => {
    console.log("=== Validating schemas ===");
    await validate();

    for (const gen of generators) {
      console.log(`\n=== Generating ${gen.label} ===`);
      await gen.fn();
    }

    console.log("\n=== Done! ===");
  });

program.parse();
