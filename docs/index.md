---
title: OXA Schema
site:
  hide_outline: true
  hide_title_block: true
---

:::{hero .col-screen} OXA Documentation
:background-image: hero.webp
:max-width: 100
:overlay: 60
:kicker: Open Exchange Architecture
:actions: [Get Started](./install.md) [Schema](./schema-overview.md)
:footer: OXA defines open, extensible JSON schemas that describe modular and composable scientific documents — bridging the gap between authoring systems like Stencila, MyST, Quarto and the scientific publishing ecosystem which uses tools like JATS.
A foundation for interoperable, structured scientific content.
:::

The **Open Exchange Architecture (OXA)** is a specification for representing scientific documents and their components as structured JSON objects.
It’s designed to enable **exchange, interoperability, and long-term preservation** of scientific knowledge, while remaining compatible with modern web and data standards.

OXA provides schemas and examples for representing:

- Executable and interactive research components
- Text, math, figures, code, and metadata
- Authors, affiliations, and licenses
- Hierarchical structures like sections and paragraphs
- Inline formatting (strong, emphasis, quote, etc.)

The format is inspired by **[unified.js](https://unifiedjs.com)** and **Pandoc AST**, following a **typed node model** with `children` arrays that form a tree.
