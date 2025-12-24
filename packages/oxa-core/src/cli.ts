/**
 * OXA CLI
 *
 * Command-line interface for validating OXA documents.
 */

import { program } from "commander";
import version from "./version.js";
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
 * Check if stderr is a TTY (for pretty output).
 */
const isTTY = process.stderr.isTTY ?? false;

/**
 * Format validation result for output.
 * Uses pretty CLI format for TTY, structured JSON for non-TTY.
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
    return;
  }

  // For non-TTY (pipes, redirects), output structured JSON
  if (!isTTY) {
    console.error(
      JSON.stringify({
        file: filePath,
        valid: false,
        errors: result.errors,
      }),
    );
    return;
  }

  // For TTY, use pretty CLI output if available
  console.error(`${filePath}: invalid`);
  if (result.prettyOutput) {
    console.error(result.prettyOutput);
  } else {
    // Fallback to structured output
    for (const error of result.errors) {
      const location = error.start
        ? ` (line ${error.start.line}, col ${error.start.column})`
        : "";
      console.error(`  ${error.path}${location}: ${error.message}`);
      if (error.suggestion) {
        console.error(`    Suggestion: ${error.suggestion}`);
      }
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

program
  .name("oxa")
  .description("CLI for validating OXA documents")
  .version(version);

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
      // Use CLI format for TTY, JS format for pipes/redirects
      const format = isTTY ? "cli" : "js";

      try {
        // Handle stdin if no files or "-" specified
        if (files.length === 0 || (files.length === 1 && files[0] === "-")) {
          const content = await readStdin();

          let result: ValidationResult;
          if (options.yaml) {
            result = validateYaml(content, { type: options.type, format });
          } else {
            result = validateJson(content, { type: options.type, format });
          }

          if (!result.valid) {
            hasFailures = true;
          }

          formatResult(result, "<stdin>", options.quiet ?? false);
        } else {
          // Validate each file
          for (const filePath of files) {
            const result = validateFile(filePath, {
              type: options.type,
              format,
            });

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
