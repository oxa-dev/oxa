---
title: "**DRAFT**: Declaring OXA representations from human-readable outputs"
date: 2025-11-10
author: Carlos Scheidegger
license: "CC BY 4.0"
---

## Intro

Documents that want to declare that they're "human-readable representations" of OXA documents can use a set of format-specific metadata annotations, depending on the document mimetype.

## Mimetypes

### `text/html`

An HTML document that wants to declare an OXA representation can do one of the following:

- include a `meta` element in the `head` block with `name="oxa-document-uri"` and `value` being the URI of an HTTP resource representing the OXA document
- include a `meta` element in the `head` block with `name="oxa-reference-uri"` and `value` being the URI of an HTTP resource representing the [OXA reference](./oxa-references.md).
- include a `meta` element in the `head` block with `name="oxa-document"` and `value` being the JSON representation of the OXA document.
- include a `meta` element in the `head` block with `name="oxa-reference"` and `value` being the JSON representation of the [OXA reference](./oxa-references.md).

### `image/png`

A PNG image that wants to declare an OXA representation can do one of the following:

- include an `tEXt` ancillary chunk with keyword `JSON:dev.oxa:oxa-document-link` and UTF-8 text with the URI of an HTTP resource representing the OXA document
- include an `tEXt` ancillary chunk with keyword `JSON:dev.oxa:oxa-reference` and UTF-8 text with the URI of an HTTP resource representing the [OXA reference](./oxa-references.md).
- include an `tEXt` ancillary chunk with keyword `JSON:dev.oxa:oxa-document` and UTF-8 text containing the JSON representation of the OXA document.
- include an `tEXt` ancillary chunk with keyword `JSON:dev.oxa:oxa-reference` and UTF-8 text containing the JSON representation of the [OXA reference](./oxa-references.md).
