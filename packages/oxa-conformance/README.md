# OXA Conformance Suite

A collection of test cases for validating OXA format conversion implementations.

## Overview

The OXA Conformance Suite provides test cases containing OXA JSON alongside equivalent representations in other formats. Tool developers building converters between OXA and other formats can use these test cases to validate their implementations.

## Installation

```bash
npm install oxa-conformance
```

Or include it as a dev dependency:

```bash
npm install -D oxa-conformance
```

## Usage

### Loading Test Cases

The package exports a manifest listing all available test cases:

```javascript
// ESM (recommended)
import manifest from "oxa-conformance";

// CommonJS
const manifest = require("oxa-conformance");

console.log(manifest.cases); // Array of test case metadata
```

Load individual test cases by reading the JSON files directly:

```javascript
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Get the path to the conformance package
const conformancePath = dirname(fileURLToPath(import.meta.resolve("oxa-conformance")));

// Load a specific test case
const textBasic = JSON.parse(
  readFileSync(resolve(conformancePath, "cases/inline/text-basic.json"), "utf-8")
);

console.log(textBasic.formats.oxa); // OXA representation
console.log(textBasic.formats.markdown); // Markdown representation
```

**Note:** If using TypeScript with `resolveJsonModule` enabled, you can also import JSON files directly.

### Running Tests

Here's an example of using the conformance suite with a testing framework:

```javascript
import { describe, it, expect } from "vitest";
import manifest from "oxa-conformance";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Your converter functions
import { oxaToMarkdown, markdownToOxa } from "./your-converter";

// Get path to conformance package
const conformancePath = dirname(fileURLToPath(import.meta.resolve("oxa-conformance")));

describe("OXA Conformance", () => {
  for (const testCase of manifest.cases) {
    const casePath = resolve(conformancePath, testCase.path);
    const caseData = JSON.parse(readFileSync(casePath, "utf-8"));

    if (caseData.formats.markdown) {
      it(`${testCase.id}: OXA → Markdown`, () => {
        const result = oxaToMarkdown(caseData.formats.oxa);
        expect(result).toBe(caseData.formats.markdown);
      });

      it(`${testCase.id}: Markdown → OXA`, () => {
        const result = markdownToOxa(caseData.formats.markdown);
        expect(result).toEqual(caseData.formats.oxa);
      });
    }
  }
});
```

## Test Case Format

Each test case is a JSON file with the following structure:

```json
{
  "$schema": "../../schemas/test-case.schema.json",
  "title": "Basic emphasis",
  "description": "Emphasized text (typically rendered as italic)",
  "category": "inline",
  "formats": {
    "oxa": { ... },
    "myst": { ... },
    "pandoc": { ... },
    "stencila": { ... },
    "markdown": "...",
    "html": "...",
    "jats": "..."
  },
  "notes": {
    "markdown": "Additional format-specific notes"
  }
}
```

### Fields

- **title**: Short descriptive title
- **description**: Detailed description of what the test validates
- **category**: One of `inline`, `block`, `document`, or `edge-case`
- **formats**: Object containing equivalent representations in each format
- **notes**: Optional format-specific notes and considerations

### Supported Formats

1. **oxa** - OXA JSON (always present, authoritative)
2. **myst** - MyST Markdown AST
3. **pandoc** - Pandoc AST JSON format
4. **stencila** - Stencila Schema JSON
5. **markdown** - CommonMark/GFM Markdown
6. **html** - Semantic HTML5
7. **jats** - JATS Publishing XML

AST-based formats (oxa, myst, pandoc, stencila) are grouped first, followed by string-based interchange formats (markdown, html, jats). This ordering makes it easier to visually scan test cases for correctness across related formats.

Not every test case includes all formats. The `oxa` format is always present and serves as the authoritative representation.

## Manifest Structure

The `manifest.json` file provides an index of all test cases:

```json
{
  "$schema": "./schemas/manifest.schema.json",
  "version": "0.1.0",
  "formats": ["oxa", "myst", "pandoc", "stencila", "markdown", "html", "jats"],
  "cases": [
    {
      "id": "text-basic",
      "path": "cases/inline/text-basic.json",
      "category": "inline",
      "nodeTypes": ["Text"]
    }
  ]
}
```

## Directory Structure

```
oxa-conformance/
├── manifest.json           # Index of all test cases
├── cases/
│   ├── inline/            # Inline node test cases
│   │   ├── text-basic.json
│   │   ├── emphasis-basic.json
│   │   └── strong-basic.json
│   └── block/             # Block node test cases
│       ├── paragraph-basic.json
│       └── heading-basic.json
└── schemas/
    ├── test-case.schema.json
    └── manifest.schema.json
```

## Contributing New Test Cases

See the [CONTRIBUTING.md](../../CONTRIBUTING.md) guide for instructions on adding new test cases to the conformance suite.

## License

MIT
