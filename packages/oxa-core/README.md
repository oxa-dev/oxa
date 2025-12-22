# oxa-core

Validation library for OXA documents.

## Installation

```bash
npm install oxa-core
```

For CLI usage, see [`oxa`](https://www.npmjs.com/package/oxa).

## Usage

```typescript
import { validate, validateFile, validateJson, validateYaml } from "oxa-core";
import type { Document } from "oxa-core";

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

// Validate a file (JSON or YAML based on extension)
const fileResult = validateFile("./document.json");

// Validate JSON string
const jsonResult = validateJson('{"type": "Document", ...}');

// Validate YAML string
const yamlResult = validateYaml("type: Document\n...");

// Validate against a specific type
const headingResult = validate(data, { type: "Heading" });
```

## API

### `validate(data, options?)`

Validate a parsed document object against the OXA schema.

### `validateJson(json, options?)`

Validate a JSON string against the OXA schema.

### `validateYaml(yaml, options?)`

Validate a YAML string against the OXA schema.

### `validateFile(filePath, options?)`

Validate a file (JSON or YAML based on extension).

### `getSchema()`

Get the bundled OXA JSON schema.

### `getTypeNames()`

Get available type names from the schema definitions.

## Related Packages

- [`oxa`](https://www.npmjs.com/package/oxa) - CLI for validating OXA documents
- [`oxa-types`](https://www.npmjs.com/package/oxa-types) - TypeScript type definitions
