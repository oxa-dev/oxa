---
title: AT Protocol Lexicon
---

OXA defines an [AT Protocol (atproto)](https://atproto.com) [Lexicon](https://atproto.com/guides/lexicon) for publishing scientific documents to the [Atmosphere](https://atproto.com/guides/understanding-atproto).

The lexicon lives under the `pub.oxa.*` namespace and enables OXA documents to be stored as records in any AT Protocol [Personal Data Server (PDS)](https://atproto.com/guides/the-at-stack), making scientific content natively available alongside social interactions, feeds, and moderation infrastructure.

## Why an AT Protocol lexicon?

Scientific publishing today relies on centralized platforms. Researchers upload papers to a service, and that service controls access, discovery, and permanence. AT Protocol offers a different model:

- **User-owned data.** Documents live in the author's signed data repository and can be migrated between hosts.
- **Decentralized discovery.** Any indexer can crawl the network's [firehose](https://atproto.com/specs/sync) to discover and aggregate scientific content.
- **Interoperability by default.** The Lexicon type system gives every consumer the same schema, so tools can read, validate, and render documents without out-of-band agreements.
- **Built-in identity.** Authors are identified by [DIDs](https://atproto.com/specs/did) and [handles](https://atproto.com/specs/handle), providing a ready-made, portable identity layer.

By defining a lexicon, OXA documents become first-class objects on the AT Protocol network, subject to the same sync, auth, and moderation primitives as any other record type.

## Lexicon structure

The OXA lexicon is organized into three namespaces:

| File                             | NSID                        | Purpose                                                                                 |
| -------------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `lexicon/document/document.json` | `pub.oxa.document.document` | The `Document` record type — the root object stored in a PDS                            |
| `lexicon/blocks/defs.json`       | `pub.oxa.blocks.defs`       | Block-level type definitions (`paragraph`, `heading`, `richText`) and the `block` union |
| `lexicon/richtext/facet.json`    | `pub.oxa.richtext.facet`    | Facet annotations for inline formatting (`emphasis`, `strong`, `byteSlice`)             |

A `Document` record contains an array of `children` (blocks). Each block carries a `text` string and an optional `facets` array that annotates ranges of that text with formatting features.

## Following the AT Protocol style guide

The lexicon follows the conventions described in the [Lexicon Style Guide](https://atproto.com/guides/lexicon-style-guide#design-patterns):

- **Rich text via facets.** Instead of embedding markup in strings, inline formatting is represented as byte-range annotations — the same pattern established by [`app.bsky.richtext.facet`](https://docs.bsky.app/docs/advanced-guides/post-richtext). This keeps text plain and makes it safe to render even if a consumer doesn't understand a particular facet type. See [why `pub.oxa.richtext.facet`?](#why-puboxa-not-appbsky) below for why OXA defines its own facet lexicon rather than reusing Bluesky's.
- **Open unions.** The `block` union and the facet `features` union are both declared with `"closed": false`, allowing future extension without breaking existing consumers.
- **Minimal required fields.** Only fields that are truly necessary for functionality are marked `required` (e.g. `children` and `createdAt` on a document, `level` on a heading). This keeps the schema flexible for evolution.
- **Singular nouns for record schemas.** The record type is named `document` (not `documents`), following the convention for record schemas.
- **Reusable definitions.** Shared types like `richText` and `byteSlice` are defined once and referenced across lexicons, following the pattern of `defs` files.
- **`createdAt` timestamp.** The document record includes a `createdAt` field (datetime string), which is standard practice for ATProto records.
- **`$type` discriminators.** Every block and facet feature carries a `$type` string so consumers can identify types in the open union without ambiguity.

(why-puboxa-not-appbsky)=

## Why `pub.oxa.richtext.facet`?

OXA defines its own facet lexicon (`pub.oxa.richtext.facet`) rather than reusing Bluesky's `app.bsky.richtext.facet`. This is a deliberate choice driven by the different domains the two lexicons serve.

Bluesky's facet features are designed for social microblogging — its feature union contains `mention` (account references), `link` (URLs), and `tag` (hashtags). These are not the annotations scientific documents need. OXA documents require typographic and semantic formatting: `emphasis`, `strong`, and in the future inline types like `subscript`, `superscript`, `inlineMath`, `inlineCode`, `link`, `cite`, and others defined in the OXA schema.

There are also structural differences. The `app.bsky.richtext.facet` features union is closed, meaning third parties cannot extend it without modifying the original lexicon. The `pub.oxa.richtext.facet` features union is declared with `"closed": false`, following the style guide's recommendation for extensibility. This allows the OXA facet feature set to grow as the schema grows. Because the lexicon is generated from the OXA schema, new inline types become facet features automatically.

Finally, the `app.bsky` namespace is owned by Bluesky PBC. Extending it with document-formatting features would conflate social and scientific concerns in a namespace OXA does not control.

### Compatible features from other namespaces

Where an OXA facet feature is semantically equivalent to a feature in another AT Protocol namespace, the converter emits both features in the same facet's `features` array. This gives consumers that understand the other namespace free interoperability without OXA depending on that namespace for its core schema.

For example, when `Link` is added to the OXA schema, a link facet will carry both the OXA feature and Bluesky's `app.bsky.richtext.facet#link`:

```json
{
  "index": { "byteStart": 10, "byteEnd": 20 },
  "features": [
    { "$type": "pub.oxa.richtext.facet#link", "uri": "https://example.com" },
    { "$type": "app.bsky.richtext.facet#link", "uri": "https://example.com" }
  ]
}
```

This works because AT Protocol facets support multiple features per byte range, and consumers ignore feature types they don't recognise. A Bluesky client rendering an OXA document record will make links clickable even though it doesn't understand `pub.oxa.richtext.facet#emphasis`.

The mapping is maintained in the `compatibleFeatures` export from `@oxa/core`. It is a record keyed by OXA facet feature `$type`, where each value is an array of functions that produce a compatible feature object (or `null` to skip). This design is not Bluesky-specific — any AT Protocol namespace can be added to the map.

## Flattening inlines into facets

The most significant transformation between an OXA document and its lexicon representation is how inline content is handled.

### OXA's tree model

In the OXA schema, inline content is a recursive tree. A `Paragraph` has `children` that can be `Text`, `Emphasis`, `Strong`, or other inline types, and formatting nodes themselves contain `children`:

```yaml
type: Paragraph
children:
  - type: Text
    value: "This is "
  - type: Strong
    children:
      - type: Text
        value: "bold and "
      - type: Emphasis
        children:
          - type: Text
            value: "italic"
  - type: Text
    value: " text."
```

### AT Protocol's flat model

AT Protocol [uses facets instead of a tree](https://www.pfrazee.com/blog/why-facets). The text is stored as a single plain string, and formatting is described by byte-range annotations:

```json
{
  "$type": "pub.oxa.blocks.defs#paragraph",
  "text": "This is bold and italic text.",
  "facets": [
    {
      "index": { "byteStart": 8, "byteEnd": 23 },
      "features": [{ "$type": "pub.oxa.richtext.facet#strong" }]
    },
    {
      "index": { "byteStart": 17, "byteEnd": 23 },
      "features": [{ "$type": "pub.oxa.richtext.facet#emphasis" }]
    }
  ]
}
```

The conversion walks the inline tree depth-first, concatenating all `Text` node values into a single string. Each formatting node records the byte offset before and after its children are processed, producing a `byteStart`/`byteEnd` pair. Indices count bytes of the UTF-8 encoded text (not characters), matching the AT Protocol convention.

This design has several advantages in a decentralized setting:

- **Safe rendering.** A consumer that doesn't recognize a facet type can still display the plain text.
- **Simple validation.** Facets are flat — there is no recursive nesting to validate.
- **Extensibility.** New facet feature types (links, mentions, math, etc.) can be added to the open union without changing the text representation.

## Converting documents with the CLI

The `oxa` CLI (provided by the `oxa` npm package) can convert an OXA document to its AT Protocol lexicon representation.

The `--to` option is required and specifies the target format. Currently the only supported format is `atproto`.

### From a JSON file

```bash
oxa convert --to atproto examples/document.json
```

### From a YAML file via stdin

```bash
cat examples/document.yaml | oxa convert --to atproto --yaml -
```

### Setting `createdAt`

By default `createdAt` is set to the current time. You can provide a fixed value:

```bash
oxa convert --to atproto --created-at 2026-03-22T00:00:00.000Z examples/document.json
```

### Example

Given this OXA document (`doc.yaml`):

```yaml
type: Document
children:
  - type: Heading
    level: 1
    children:
      - type: Text
        value: Hello
  - type: Paragraph
    children:
      - type: Text
        value: "Some "
      - type: Emphasis
        children:
          - type: Text
            value: emphasized
      - type: Text
        value: " text."
```

Running:

```bash
oxa convert --to atproto --yaml --created-at 2026-01-01T00:00:00.000Z doc.yaml
```

Produces:

```json
{
  "$type": "pub.oxa.document.document",
  "children": [
    {
      "$type": "pub.oxa.blocks.defs#heading",
      "level": 1,
      "text": "Hello",
      "facets": []
    },
    {
      "$type": "pub.oxa.blocks.defs#paragraph",
      "text": "Some emphasized text.",
      "facets": [
        {
          "index": { "byteStart": 5, "byteEnd": 15 },
          "features": [{ "$type": "pub.oxa.richtext.facet#emphasis" }]
        }
      ]
    }
  ],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### Programmatic API

The conversion functions are also exported from the `@oxa/core` package:

```typescript
import {
  flattenInlines,
  mapBlock,
  oxaToAtproto,
  compatibleFeatures,
} from "@oxa/core";

const atprotoRecord = oxaToAtproto(oxaDocument, {
  createdAt: "2026-01-01T00:00:00.000Z",
});
```

The `compatibleFeatures` export is a mutable record that controls which additional facet features from other AT Protocol namespaces are emitted alongside OXA features (see [compatible features](#compatible-features-from-other-namespaces) above). You can add or remove entries to customize interoperability:

```typescript
import { compatibleFeatures } from "@oxa/core";

// Emit a hypothetical shared-namespace feature alongside OXA links
compatibleFeatures["pub.oxa.richtext.facet#link"] = [
  (node) => ({
    $type: "org.example.richtext.facet#link",
    uri: node.uri as string,
  }),
];
```

## Generated from the OXA schema

The lexicon files are generated from the OXA YAML schema definitions by the codegen script (`scripts/lib/generate-lexicon.ts`). The generator:

1. Loads the merged OXA JSON Schema.
2. Classifies each type as inline or block based on the `Inline` and `Block` union definitions.
3. Maps inline types to facet features in `pub.oxa.richtext.facet` (excluding `Text`, which becomes the plain text string).
4. Maps block types to object definitions in `pub.oxa.blocks.defs`, replacing their inline `children` arrays with `text` + `facets` pairs.
5. Emits the `Document` record type in `pub.oxa.document.document`.

To regenerate the lexicon after changing the schema:

```bash
pnpm --filter scripts codegen lexicon
```

This means that when a new type is added to the OXA schema — for example a new inline type like `Subscript` or a new block type like `CodeBlock` — it is **immediately available** in the lexicon after running codegen. New inline types automatically appear as facet features in the open union, and new block types appear in the block union. No manual lexicon authoring is required.

## Further reading

- [AT Protocol documentation](https://atproto.com/docs)
- [Lexicon specification](https://atproto.com/specs/lexicon)
- [Lexicon Style Guide](https://atproto.com/guides/lexicon-style-guide)
- ["Why RichText facets in Bluesky"](https://www.pfrazee.com/blog/why-facets) — the design rationale behind facets
- [OXA Schema overview](./schema-overview.md)
