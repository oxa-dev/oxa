# Open eXchance Architecture

## Motivation

Document authoring systems such as [Quarto](https://quarto.org) and [Myst](https://mystmd.org/) want the ability to retrieve JSON representations of existing documents in a machine-readable form.

## Terminology

In this document, uppercase phrases are used according to [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

## Spec

### JSON object equality

When comparingn two JSON objects, this spec uses the word "equals" to mean two objects that are the same according to the [SameValueZero algorithm in the ECMA 262 spec](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero).

### Canonical Hashes

In this document, the "canonical hash" of a JSON object, given a hashing function, is a JSON object that satisfies the following JSON schema

```json
{
    "type": "object",
    "required": ["function", "hash"],
    "properties": {
    "function": {
        "type": "string",
        "enum": ["SHA-256", "SHA-512", "SHA3-256", "SHA3-512"]
    },
    "hash": {
        "type": "string",
        "pattern": "^[a-fA-F0-9]+$"
    }
    },
    "additionalProperties": false
}
```

The field `hash` encodes the hexadecimal digits of result of running the hash function `function` on the canonical version (cf. [RFC 8785](https://datatracker.ietf.org/doc/html/rfc8785)) of a JSON object.

### JSON Interop Object

A JSON document that respects the following spec will be referred to as "a JSON interop object".

A JSON interop object MUST be a JSON object (RFC-8259) that respects the following JSON schema:

```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["schemaHash", "contentHash"],
  "definitions": {
    "hashObject": {
      "type": "object",
      "required": ["function", "hash"],
      "properties": {
        "function": {
          "type": "string",
          "enum": ["SHA-256", "SHA-512", "SHA3-256", "SHA3-512"]
        },
        "hash": {
          "type": "string",
          "pattern": "^[a-fA-F0-9]+$"
        }
      },
      "additionalProperties": false
    }
  },
  "properties": {
    "schemaHash": {
      "$ref": "#/definitions/hashObject"
    },
    "contentHash": {
      "$ref": "#/definitions/hashObject"
    },
    "schema": {
      "$ref": "http://json-schema.org/draft-07/schema#"
    }
    "schemaHref": {
      "type": "string",
      "format": "uri"
    },
    "contentHref": {
      "type": "string",
      "format": "uri"
    }
  }
}
```

The `schemaHash` field MUST equal the canonical hash of a JSON object representing some JSON schema.

The `contentHash` field MUST equal the canonical hash of some JSON object.

If the `schema` field is present, it MUST contain a JSON object whose canonical hash equals the value in the `schemaHash` field.

If the `content` field is present, it MUST contain a JSON object whose canonical hash equals the value in the `contentHash` field.

If the `schemaHref` field is present, then an HTTP GET request issued against the URI referenced SHOULD respond with an `application/json` object whose canonical hash equals the value in the `schemaHash` field.

If the `contentHref` field is present, then an HTTP GET request issued against the URI referenced SHOULD respond with an `application/json` object whose canonical hash equals the value in the `contentHash` field.

## Authors

- Rowan Cockett - Curvenote
- Franklin Koch - Curvenote
- Carlos Scheidegger - Posit, PBC
- Nokome Bentley - Stencilla

## versions

- 0.0.1: 2025-11-07