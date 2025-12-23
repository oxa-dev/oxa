/**
 * Load the OXA version from oxa-types-ts package.json.
 *
 * The oxa-types-ts package is the source of truth for versioning.
 * Changesets bumps this version, and codegen syncs it to Python and Rust.
 */

import { readFileSync } from "fs";
import { join } from "path";

const PACKAGE_PATH = join(
  import.meta.dirname,
  "../../packages/oxa-types-ts/package.json",
);

export function getVersion(): string {
  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf-8"));
  return pkg.version;
}
