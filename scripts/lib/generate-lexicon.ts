/**
 * Generate AT Protocol Lexicon files from the OXA JSON Schema.
 *
 * This module translates the OXA tree-structured document schema into
 * AT Protocol Lexicon format, following the patterns established by
 * Bluesky's own lexicons (e.g., app.bsky.richtext.facet).
 *
 * The key transformation is flattening OXA's recursive inline content
 * tree (Text, Emphasis, Strong, etc.) into AT Proto's flat rich text
 * model (a plain text string + facets with byte-slice annotations).
 *
 * Output files:
 *   lexicon/richtext/facet.json   — facet definition + inline feature types
 *   lexicon/blocks/defs.json      — block-level type defs and rich text helper
 *   lexicon/document/document.json — the Document record type
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { loadMergedSchema } from "./schema.js";

const LEXICON_DIR = join(import.meta.dirname, "../../lexicon");

interface SchemaProperty {
  type?: string;
  const?: string;
  enum?: string[];
  description?: string;
  items?: { $ref?: string; type?: string };
  $ref?: string;
  minimum?: number;
  maximum?: number;
  additionalProperties?: boolean;
}

interface SchemaDefinition {
  title: string;
  description?: string;
  type?: string;
  anyOf?: Array<{ $ref: string }>;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

interface LexiconFile {
  lexicon: number;
  id: string;
  defs: Record<string, unknown>;
}

export async function generateLexicon(): Promise<void> {
  const schema = loadMergedSchema();
  const definitions = schema.definitions as Record<string, SchemaDefinition>;

  // Classify types by union membership
  const inlineMembers = getUnionMembers(definitions, "Inline");
  const blockMembers = getUnionMembers(definitions, "Block");

  // Generate the three lexicon files
  const facetFile = generateFacetLexicon(definitions, inlineMembers);
  const blocksDefsFile = generateBlocksDefsLexicon(definitions, blockMembers);
  const documentFile = generateDocumentLexicon(definitions);

  // Write files
  writeLexiconFile(join(LEXICON_DIR, "richtext", "facet.json"), facetFile);
  writeLexiconFile(join(LEXICON_DIR, "blocks", "defs.json"), blocksDefsFile);
  writeLexiconFile(join(LEXICON_DIR, "document.json"), documentFile);

  console.log(`Generated lexicon files in ${LEXICON_DIR}`);
}

function getUnionMembers(
  definitions: Record<string, SchemaDefinition>,
  unionName: string,
): string[] {
  const def = definitions[unionName];
  if (!def?.anyOf) return [];
  return def.anyOf.map((item) => item.$ref.replace("#/definitions/", ""));
}

/**
 * Generate pub.oxa.richtext.facet lexicon.
 *
 * Follows the Bluesky pattern: main has `index` (ref to #byteSlice)
 * and `features` (array of union refs to feature types).
 * Each inline type from OXA becomes a facet feature def.
 * Text is excluded — it represents the plain text string itself.
 */
function generateFacetLexicon(
  definitions: Record<string, SchemaDefinition>,
  inlineMembers: string[],
): LexiconFile {
  const defs: Record<string, unknown> = {};

  // Collect feature type names (excluding Text, which becomes the text string)
  const featureNames = inlineMembers.filter((name) => name !== "Text");
  const featureRefs = featureNames.map((name) => `#${toCamelCase(name)}`);

  // main: the facet object with index + features, matching Bluesky's pattern
  defs["main"] = {
    type: "object",
    description: "Annotation of a sub-string within rich text.",
    required: ["index", "features"],
    properties: {
      index: { type: "ref", ref: "#byteSlice" },
      features: {
        type: "array",
        items: { type: "union", closed: false, refs: featureRefs },
      },
    },
  };

  // byteSlice: byte-range index, matching Bluesky's pattern
  defs["byteSlice"] = {
    type: "object",
    description:
      "Specifies the sub-string range a facet feature applies to. Start index is inclusive, end index is exclusive. Indices are zero-indexed, counting bytes of the UTF-8 encoded text.",
    required: ["byteStart", "byteEnd"],
    properties: {
      byteStart: { type: "integer", minimum: 0 },
      byteEnd: { type: "integer", minimum: 0 },
    },
  };

  // Generate a feature def for each inline type (except Text)
  for (const name of featureNames) {
    const def = definitions[name];
    if (!def) continue;

    const featureDef: Record<string, unknown> = { type: "object" };

    if (def.description) {
      featureDef.description = def.description;
    }

    // Extract non-structural properties from the inline type.
    // Skip: type (AT Proto uses $type), children (structural — the facet
    // byte-slice replaces this), id/classes/data (preserved at block level
    // but not meaningful on facet features).
    const featureProps = extractNonStructuralProperties(def, true);
    if (featureProps) {
      const { properties, required } = featureProps;
      if (Object.keys(properties).length > 0) {
        featureDef.properties = properties;
        if (required.length > 0) {
          featureDef.required = required;
        }
      }
    }

    defs[toCamelCase(name)] = featureDef;
  }

  return {
    lexicon: 1,
    id: "pub.oxa.richtext.facet",
    defs,
  };
}

/**
 * Generate pub.oxa.blocks.defs lexicon.
 *
 * Contains:
 * - richText: reusable object with text + facets (like Bluesky's pattern)
 * - One def per block type, with children: Inline[] flattened to richText
 * - block: union of all block types
 */
function generateBlocksDefsLexicon(
  definitions: Record<string, SchemaDefinition>,
  blockMembers: string[],
): LexiconFile {
  const defs: Record<string, unknown> = {};

  // richText: reusable def for text + facets
  defs["richText"] = {
    type: "object",
    description:
      "Rich text content: a plain text string with facet annotations.",
    properties: {
      text: { type: "string" },
      facets: {
        type: "array",
        items: {
          type: "ref",
          ref: "pub.oxa.richtext.facet",
        },
      },
    },
  };

  // Generate a def for each block type
  for (const name of blockMembers) {
    const def = definitions[name];
    if (!def) continue;

    const blockDef: Record<string, unknown> = { type: "object" };

    if (def.description) {
      blockDef.description = def.description;
    }

    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    const schemaRequired = new Set(def.required || []);

    for (const [propName, prop] of Object.entries(def.properties || {})) {
      // Skip 'type' — AT Proto uses $type
      if (propName === "type") continue;

      // Flatten children: Inline[] → richText ref
      if (propName === "children" && isInlineArray(prop)) {
        properties["text"] = { type: "string" };
        properties["facets"] = {
          type: "array",
          items: {
            type: "ref",
            ref: "pub.oxa.richtext.facet",
          },
        };
        continue;
      }

      // Preserve id, classes, data, and other properties
      const lexProp = convertPropertyToLexicon(prop);
      if (lexProp) {
        properties[propName] = lexProp;
        if (schemaRequired.has(propName) && propName !== "type") {
          required.push(propName);
        }
      }
    }

    if (Object.keys(properties).length > 0) {
      blockDef.properties = properties;
    }
    if (required.length > 0) {
      blockDef.required = required;
    }

    defs[toCamelCase(name)] = blockDef;
  }

  // block: union of all block types
  defs["block"] = {
    type: "union",
    closed: false,
    refs: blockMembers.map((name) => `#${toCamelCase(name)}`),
  };

  return {
    lexicon: 1,
    id: "pub.oxa.blocks.defs",
    defs,
  };
}

/**
 * Generate pub.oxa.document lexicon.
 *
 * The Document type becomes a record (matching Bluesky's app.bsky.feed.post pattern).
 */
function generateDocumentLexicon(
  definitions: Record<string, SchemaDefinition>,
): LexiconFile {
  const docDef = definitions["Document"];
  if (!docDef) {
    throw new Error("Document type not found in schema");
  }

  const recordProperties: Record<string, unknown> = {};
  const required: string[] = [];
  const schemaRequired = new Set(docDef.required || []);

  for (const [propName, prop] of Object.entries(docDef.properties || {})) {
    // Skip 'type' — AT Proto uses $type
    if (propName === "type") continue;

    // Title: Inline[] → richText ref
    if (propName === "title" && isInlineArray(prop)) {
      recordProperties["title"] = {
        type: "ref",
        ref: "pub.oxa.blocks.defs#richText",
      };
      continue;
    }

    // Children: Block[] → array of block union refs
    if (propName === "children" && isBlockArray(prop)) {
      recordProperties["children"] = {
        type: "array",
        items: {
          type: "ref",
          ref: "pub.oxa.blocks.defs#block",
        },
      };
      if (schemaRequired.has(propName)) {
        required.push(propName);
      }
      continue;
    }

    // Preserve other properties (id, classes, data, metadata)
    const lexProp = convertPropertyToLexicon(prop);
    if (lexProp) {
      recordProperties[propName] = lexProp;
      if (schemaRequired.has(propName) && propName !== "type") {
        required.push(propName);
      }
    }
  }

  // Add createdAt following the Bluesky record pattern
  recordProperties["createdAt"] = {
    type: "string",
    format: "datetime",
  };
  required.push("createdAt");

  const recordObject: Record<string, unknown> = {
    type: "object",
    properties: recordProperties,
  };
  if (required.length > 0) {
    recordObject.required = required;
  }

  return {
    lexicon: 1,
    id: "pub.oxa.document",
    defs: {
      main: {
        type: "record",
        description: docDef.description,
        key: "tid",
        record: recordObject,
      },
    },
  };
}

/**
 * Convert an OXA JSON Schema property to a Lexicon property.
 */
function convertPropertyToLexicon(
  prop: SchemaProperty,
): Record<string, unknown> | null {
  // Handle string enums
  if (prop.enum && prop.enum.length > 1) {
    return { type: "string", knownValues: prop.enum };
  }

  // Handle arrays
  if (prop.type === "array" && prop.items) {
    if (prop.items.type === "string") {
      return { type: "array", items: { type: "string" } };
    }
    if (prop.items.$ref) {
      const refType = prop.items.$ref.replace("#/definitions/", "");
      return {
        type: "array",
        items: { type: "ref", ref: resolveRefToLexicon(refType) },
      };
    }
    return { type: "array", items: { type: "unknown" } };
  }

  // Handle $ref
  if (prop.$ref) {
    const refType = prop.$ref.replace("#/definitions/", "");
    return { type: "ref", ref: resolveRefToLexicon(refType) };
  }

  // Handle basic types
  switch (prop.type) {
    case "string":
      return { type: "string" };
    case "integer": {
      const result: Record<string, unknown> = { type: "integer" };
      if (prop.minimum !== undefined) result.minimum = prop.minimum;
      if (prop.maximum !== undefined) result.maximum = prop.maximum;
      return result;
    }
    case "number":
      // ATProto Lexicon has no float type; encode as string to avoid
      // silently truncating fractional values.
      return { type: "string", description: "Numeric value (JSON number)" };
    case "boolean":
      return { type: "boolean" };
    case "object":
      return { type: "unknown" };
    default:
      return { type: "unknown" };
  }
}

/**
 * Check if a property is an array of Inline refs.
 */
function isInlineArray(prop: SchemaProperty): boolean {
  return prop.type === "array" && prop.items?.$ref === "#/definitions/Inline";
}

/**
 * Check if a property is an array of Block refs.
 */
function isBlockArray(prop: SchemaProperty): boolean {
  return prop.type === "array" && prop.items?.$ref === "#/definitions/Block";
}

/**
 * Extract non-structural properties from an inline type definition.
 * Skips: type, children (recursive inline content), and optionally
 * common node properties (id, classes, data) for facet features.
 */
function extractNonStructuralProperties(
  def: SchemaDefinition,
  isFacetFeature: boolean,
): { properties: Record<string, unknown>; required: string[] } | null {
  if (!def.properties) return null;

  const skip = new Set(["type", "children", "prefix", "suffix"]);
  if (isFacetFeature) {
    // Facet features don't carry id/classes/data — these are node-level
    // concerns that don't translate to byte-range annotations
    skip.add("id");
    skip.add("classes");
    skip.add("data");
  }

  const schemaRequired = new Set(def.required || []);
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [propName, prop] of Object.entries(def.properties)) {
    if (skip.has(propName)) continue;

    const lexProp = convertPropertyToLexicon(prop);
    if (lexProp) {
      properties[propName] = lexProp;
      if (schemaRequired.has(propName)) {
        required.push(propName);
      }
    }
  }

  return { properties, required };
}

/**
 * Resolve an OXA type name to a Lexicon NSID reference.
 * This is a placeholder for when more types are added to the schema.
 */
function resolveRefToLexicon(typeName: string): string {
  // For now, types map to block defs
  return `pub.oxa.blocks.defs#${toCamelCase(typeName)}`;
}

function toCamelCase(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function writeLexiconFile(path: string, content: LexiconFile): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(content, null, 2) + "\n");
  console.log(`  ${path}`);
}
