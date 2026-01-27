/**
 * OXA Conformance Suite CommonJS entrypoint
 */

const manifest = require("./manifest.json");

/**
 * All test cases keyed by id
 */
const cases = Object.fromEntries(
  manifest.cases.map((c) => [c.id, require(`./${c.path}`)])
);

module.exports.manifest = manifest;
module.exports.cases = cases;
