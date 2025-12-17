/**
 * Load the OXA version from package.json.
 */

import { readFileSync } from "fs";
import { join } from "path";

const PACKAGE_PATH = join(import.meta.dirname, "../../package.json");

export function getVersion(): string {
  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf-8"));
  return pkg.version;
}
