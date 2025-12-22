/**
 * OXA CLI
 *
 * Command-line interface for validating OXA documents.
 */

import { program } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  validateFile,
  validateJson,
  validateYaml,
  type ValidationResult,
} from "./validate.js";

// Exit codes
const EXIT_SUCCESS = 0;
const EXIT_VALIDATION_FAILURE = 1;
const EXIT_EXECUTION_ERROR = 2;

/**
 * Format validation result for output.
 */
function formatResult(
  result: ValidationResult,
  filePath: string,
  quiet: boolean,
): void {
  if (result.valid) {
    if (!quiet) {
      console.log(`${filePath}: valid`);
    }
  } else {
    console.error(`${filePath}: invalid`);
    for (const error of result.errors) {
      console.error(`  ${error.path}: ${error.message}`);
    }
  }
}

/**
 * Read all content from stdin.
 */
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

/**
 * Get package version from package.json.
 */
function getVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

program
  .name("oxa")
  .description("CLI for validating OXA documents")
  .version(getVersion());

program
  .command("validate")
  .description("Validate JSON or YAML files against the OXA schema")
  .argument("[files...]", "Files to validate (use - for stdin)")
  .option(
    "-t, --type <type>",
    "Validate against a specific type (e.g., Document, Heading)",
  )
  .option("--json", "Parse stdin as JSON (default)")
  .option("--yaml", "Parse stdin as YAML")
  .option("-q, --quiet", "Only output errors")
  .action(
    async (
      files: string[],
      options: {
        type?: string;
        json?: boolean;
        yaml?: boolean;
        quiet?: boolean;
      },
    ) => {
      let hasFailures = false;

      try {
        // Handle stdin if no files or "-" specified
        if (files.length === 0 || (files.length === 1 && files[0] === "-")) {
          const content = await readStdin();

          let result: ValidationResult;
          if (options.yaml) {
            result = validateYaml(content, { type: options.type });
          } else {
            result = validateJson(content, { type: options.type });
          }

          if (!result.valid) {
            hasFailures = true;
          }

          formatResult(result, "<stdin>", options.quiet ?? false);
        } else {
          // Validate each file
          for (const filePath of files) {
            const result = validateFile(filePath, { type: options.type });

            if (!result.valid) {
              hasFailures = true;
            }

            formatResult(result, filePath, options.quiet ?? false);
          }
        }

        process.exit(hasFailures ? EXIT_VALIDATION_FAILURE : EXIT_SUCCESS);
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(EXIT_EXECUTION_ERROR);
      }
    },
  );

program.parse();
