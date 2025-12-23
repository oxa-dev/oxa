---
title: Get Started
---

OXA provides tools and libraries for working with OXA documents in multiple languages. This guide will help you get started quickly.

## Installation

### Command Line Tool

The OXA CLI tool allows you to validate OXA documents from the command line.

::::{tab-set}
:::{tab-item sync=js} NPM

```bash
npm install -g oxa
```

:::

:::{tab-item sync=py} Python

```bash
pip install oxa
```

:::
::::

## Quick Start

### Validate a Document

Once installed, you can validate OXA documents:

```bash
# Validate a JSON file
oxa validate document.json

# Validate multiple files
oxa validate *.json

# Validate from stdin
cat document.json | oxa validate -

# Validate YAML files
oxa validate document.yaml

# Validate against a specific node type
oxa validate --type Heading heading.json

# Quiet mode (only show errors)
oxa validate -q *.json
```

### Example Document

Create a simple OXA document in `example.json`:

```json
{
  "type": "Document",
  "children": [
    {
      "type": "Heading",
      "level": 1,
      "children": [
        {
          "type": "Text",
          "value": "Hello, OXA!"
        }
      ]
    },
    {
      "type": "Paragraph",
      "children": [
        {
          "type": "Text",
          "value": "This is a simple OXA document."
        }
      ]
    }
  ]
}
```

Validate it:

```bash
oxa validate example.json
```

## Programmatic Libraries

For programmatic usage in your applications, install the appropriate library for your language:

::::{tab-set}
:::{tab-item sync=js} JavaScript/TypeScript

```bash
# Core validation library
npm install @oxa/core

# TypeScript type definitions
npm install oxa-types
```

:::

:::{tab-item sync=py} Python

```bash
pip install oxa-types
```

:::

:::{tab-item sync=rs} Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
oxa-types = "0.1.0"
```

:::
::::

### Using the Programmatic API

::::{tab-set}

:::{tab-item sync=js} JavaScript/TypeScript

```typescript
import { validate } from "@oxa/core";
import type { Document } from "oxa-types";

const document: Document = {
  type: "Document",
  children: [
    {
      type: "Paragraph",
      children: [{ type: "Text", value: "Hello, world!" }],
    },
  ],
};

const result = validate(document);
if (result.valid) {
  console.log("Document is valid!");
} else {
  console.error("Validation errors:", result.errors);
}
```

:::

:::{tab-item sync=py} Python

```python
from oxa_types import Document, Paragraph, Text

document = Document(
    children=[
        Paragraph(
            children=[
                Text(value="Hello, world!")
            ]
        )
    ]
)
```

:::
::::

## Next Steps

- Learn about the [OXA Schema](./schema.md) structure
- Explore the [Schema Reference](./schema/index.md) for detailed node types
- Check out examples in the [OXA repository](https://github.com/oxa-dev/oxa)

## Getting Help

- Join the [Discord community](https://discord.oxa.dev)
- Report issues on [GitHub](https://github.com/oxa-dev/oxa)
