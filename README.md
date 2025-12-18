<p align="center"><img src="logo.png" height="150px" /></p>

# OXA — The Open Exchange Architecture

> **A foundation for interoperable, structured scientific content.**
> OXA defines open, extensible JSON schemas that describe modular and composable scientific documents — bridging the gap between authoring systems like **Stencila**, **MyST**, **Quarto** and the scientific publishing ecosystem which uses tools like **JATS**.

## Overview

The **Open Exchange Architecture (OXA)** is a specification for representing scientific documents and their components as structured JSON objects.
It’s designed to enable **exchange, interoperability, and long-term preservation** of scientific knowledge, while remaining compatible with modern web and data standards.

OXA provides schemas and examples for representing:

- Executable and interactive research components
- Text, math, figures, code, and metadata
- Authors, affiliations, and licenses
- Hierarchical structures like sections and paragraphs
- Inline formatting (strong, emphasis, quote, etc.)

The format is inspired by **[unified.js](https://unifiedjs.com)** and **Pandoc AST**, following a **typed node model** with `children` arrays that form a tree.

## Design Principles

- **Open by design:** JSON Schema–based and CC0-licensed for reuse and extension.
- **Composable:** Each node is self-contained, typed, and can be nested or reused.
- **Interoperable:** Compatible with MyST Markdown, Stencila, Quarto, and similar formats.
- **Extensible:** Add new node types while preserving schema validation.
- **Typed & linked:** Everything has a clear `type`, optional `id`, and structured `data` field.
- **Modular**: Documents and components can link across projects, enabling rich cross-references, citations, and reuse of figures, data, or methods from distributed sources.
- **Computational**: Build in the schemas for computational scientific content (e.g. Notebooks)

## Supporters

OXA stands on the shoulders of open projects that make interoperability in science possible.

- [**openRxiv**](https://openrxiv.org) — building open infrastructures for federated preprints and modular scientific publishing.
- [**Stencila**](https://stenci.la) — open tools for executable documents, bridging computation and publishing.
- [**Continuous Science Foundation**](https://csf.now) — advancing a movement toward continuous, connected, and transparent research communication.
- [**Curvenote**](https://curvenote.com) — scientific content management and publishing infrastructure built on MyST and open standards.
- [**Project Jupyter — MyST-MD**](https://mystmd.org) — extending Markdown for executable, richly structured scientific content.
- [**Posit (Quarto)**](https://quarto.org) — an open-source publishing system for scientific and technical communication, supporting reproducible research and interoperability.
- [**Creative Commons**](https://creativecommons.org) — defining open licenses and rights frameworks that make scientific reuse possible.

## Core Concepts

Every OXA node shares a common shape:

```yaml
type: CapitalizedString
id: optional-string
classes:
  - style1
  - style2
data:
  key: value
children: []
```

### Common properties

| Property   | Type                   | Description                                               |
| ---------- | ---------------------- | --------------------------------------------------------- |
| `type`     | `string` (Capitalized) | The node type, e.g. `"Paragraph"`, `"Text"`, `"Heading"`. |
| `id`       | `string`               | Unique identifier for referencing and linking nodes.      |
| `classes`  | `array[string]`        | Optional styling or semantic classes.                     |
| `data`     | `object`               | Arbitrary metadata (e.g. attributes, provenance, DOI).    |
| `children` | `array`                | Nested content nodes — block or inline types.             |

## 🧩 Example Node Types

### Inline Nodes

- `Text`
- `Emphasis`
- `Strong`
- `Underline`
- `SmallCaps`
- `Strikeout`
- `Superscript`
- `Subscript`
- `InlineQuote`
- `InlineMath`
- `Link`
- `Image`
- `CiteGroup`
- `Cite`
- `Span`

```yaml
type: "Emphasis"
id: "i-am-an-emphasis"
classes:
  - emphasized
data:
  note: "example"
children:
  - type: "Text"
    value: "Hello world"
  - type: "Strong"
    children:
      - type: "Text"
        value: "This is strong text."
```

### Block Nodes

- `Paragraph`
- `Heading`
- `CodeBlock`
- `BlockQuote`
- `Section`
- `Div`

```yaml
type: "Heading"
id: "intro"
level: 2
classes: [highlighted]
children:
  - type: "Text"
    value: "Introduction"
```

## The Document Node

All OXA documents are valid JSON structures that conform to the root `OXA` schema.

```yaml
type: OXA
version: 0.0.1
metadata:
  license: "CC-BY-4.0"
  author: "Jane Doe"
  title:
    - type: Text
      value: "Hello, World"
children:
  - type: Heading
    level: 1
    children:
      - type: Text
        value: "Heading One"
  - type: Paragraph
    children:
      - type: Text
        value: "Hello world with the "
      - type: InlineMath
        value: '\pi'
      - type: Text
        value: " and "
      - type: InlineCode
        value: "1 + 2"
      - type: Text
        value: " and foo."
  - type: CodeBlock
    data:
      executable: true
      language: python
    id: foo
    value: |-
      from matplotlib import pyplot as plt
      plt.plot([1, 2, 3])
```

---

## Relationship to Other Formats

| System            | Relationship                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **JATS**          | Conceptual ancestor, simplified and modernized for web-native use.                                           |
| **Schema.org**    | Conceptual ancestor, for naming the concepts, attributes, and descriptions.                                  |
| **Pandoc AST**    | Conceptual ancestor, simplified and modernized for web-native use.                                           |
| **Stencila**      | Functional and conceptual ancestor for many typing Schema-aligned for computational notebooks and documents. |
| **MyST Markdown** | Conceptual ancestor, round-trippable via AST representation.                                                 |
| **Quarto**        | Compatible structure for render and metadata pipelines.                                                      |

## Validation

Schemas are defined in JSON Schema Draft-07 and validated using standard tools:

```bash
npm install oxa -g
oxa validate -d examples/document.json
```

Or in Python:

```bash
pip install oxa
oxa validate -d examples/document.json
```

The schema can be downloaded from oxa.dev.

https://oxa.dev/schemas/0.0.1.json

## Licensing and Attribution

Each document can include licensing and rights metadata:

```yaml
license:
  name: "CC-BY-SA-4.0"
  text: |
    Licensed under Creative Commons Attribution-ShareAlike 4.0.
  attribution: |
    Please credit the University of California, Davis.
  source: "https://creativecommons.org/licenses/by-sa/4.0/"
```

OXA can generate:

- License link and badge
- Rights statement
- Attribution and reuse statements

## 🚀 Get Involved

OXA is an **open community specification**.
We welcome contributions from tool builders, publishers, and researchers who want to advance interoperable, open science.

- Extend the schema for your tools
- Discuss interoperability on issues
- Submit examples and validators

> **Join us in building the foundation of a more connected scientific ecosystem.**

- [Slack](https://slack.continuousfoundation.org)
