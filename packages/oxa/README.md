# oxa

CLI for validating OXA documents.

## Installation

```bash
# Global CLI installation
npm install -g oxa

# Local development dependency
npm install oxa
```

For programmatic usage (validation functions and types), install `oxa-core`:

```bash
npm install oxa-core
```

## CLI Usage

```bash
# Validate files
oxa validate document.json
oxa validate *.yaml

# Validate from stdin
cat document.json | oxa validate -
echo '{"type": "Document", ...}' | oxa validate --json -

# Validate YAML from stdin
cat document.yaml | oxa validate --yaml -

# Validate against a specific type
oxa validate --type Heading heading.json

# Quiet mode (only show errors)
oxa validate -q *.json
```

## Exit Codes

- `0`: All files are valid
- `1`: One or more validation failures
- `2`: Execution error (file not found, parse error, etc.)

## Programmatic Usage

For programmatic usage, use the `oxa-core` package:

```typescript
import { validate, validateFile, validateJson, Document } from "oxa-core";

// Validate a document object
const doc: Document = {
  type: "Document",
  metadata: {},
  title: [{ type: "Text", value: "Hello", classes: [], data: {} }],
  children: [],
};

const result = validate(doc);
if (result.valid) {
  console.log("Document is valid!");
} else {
  console.error("Validation errors:", result.errors);
}

// Validate a file
const fileResult = validateFile("./document.json");

// Validate JSON string
const jsonResult = validateJson('{"type": "Document", ...}');
```

## Related Packages

- [`oxa-core`](https://www.npmjs.com/package/oxa-core) - Validation library with programmatic API
- [`oxa-types`](https://www.npmjs.com/package/oxa-types) - TypeScript type definitions
