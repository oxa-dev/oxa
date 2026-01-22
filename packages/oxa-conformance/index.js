/**
 * OXA Conformance Suite entrypoint
 *
 * Re-exports manifest.json for Node ESM compatibility.
 * This avoids the need for import assertions when consuming the package.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const manifest = require("./manifest.json");
export default manifest;
