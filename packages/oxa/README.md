# oxa

CLI for validating OXA documents.

## Installation

```bash
npm install -g oxa
```

For programmatic usage (validation functions and types), see [`@oxa/core`](https://www.npmjs.com/package/@oxa/core).

## Usage

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

## Related Packages

- [`@oxa/core`](https://www.npmjs.com/package/@oxa/core) - Validation library with programmatic API
- [`oxa-types`](https://www.npmjs.com/package/oxa-types) - TypeScript type definitions
