---
title: Schema
---

# OXA Schema

The OXA schema defines the structure and types for representing scientific documents as JSON objects. All OXA documents conform to JSON Schema Draft-07, enabling validation and interoperability.

## Schema Overview

Every OXA node follows a common structure:

```yaml
type: NodeType # Required: The node type identifier
id: optional-string # Optional: Unique identifier for referencing
classes: [] # Optional: Styling or semantic classes
data: {} # Optional: Arbitrary metadata
children: [] # Optional: Nested content nodes
```

### Common Properties

| Property   | Type                   | Description                                               |
| ---------- | ---------------------- | --------------------------------------------------------- |
| `type`     | `string` (Capitalized) | The node type, e.g. `"Paragraph"`, `"Text"`, `"Heading"`. |
| `id`       | `string`               | Unique identifier for referencing and linking nodes.      |
| `classes`  | `array[string]`        | Optional styling or semantic classes.                     |
| `data`     | `object`               | Arbitrary metadata (e.g. attributes, provenance, DOI).    |
| `children` | `array`                | Nested content nodes — block or inline types.             |

## Node Types

OXA defines several categories of node types:

### Document Node

The root node of every OXA document:

- [Document](#oxa:document) — The root container with metadata, title, and block content

### Block Nodes

Block-level content that forms the document structure:

- [Heading](#oxa:heading) — Section headings with levels (1-6)
- [Paragraph](#oxa:paragraph) — Text paragraphs

### Inline Nodes

Inline content that appears within block nodes:

- [Text](#oxa:text) — Plain text content
- [Strong](#oxa:strong) — Strong emphasis (typically bold)

## Accessing the Schema

### Download the Schema

The OXA schema is available as a JSON Schema file:

<https://oxa.dev/v0.1.0/schema.json>

### Schema Versioning

OXA uses semantic versioning for schema releases. The current version is **0.1.0**. When accessing schemas programmatically, always specify the version:

```bash
# Download specific version
curl https://oxa.dev/v0.1.0/schema.json > schema.json
```

## Design Principles

The OXA schema follows these design principles:

- **Open by design:** JSON Schema–based and CC0-licensed for reuse and extension
- **Composable:** Each node is self-contained, typed, and can be nested or reused
- **Interoperable:** Compatible with MyST Markdown, Stencila, Quarto, and similar formats
- **Extensible:** Add new node types while preserving schema validation
- **Typed & linked:** Everything has a clear `type`, optional `id`, and structured `data` field
- **Modular:** Documents and components can link across projects
- **Computational:** Built-in support for executable and interactive research components

## Related Resources

- [Get Started Guide](./install.md) — Installation and quick start
- [Schema Reference](./schema/index.md) — Detailed node type documentation
- [OXA Repository](https://github.com/oxa-dev/oxa) — Source code and examples
