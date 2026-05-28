/**
 * Minimal inline conversion helpers for OXA rich text.
 *
 * All functions take a `Session` object as their first argument.
 */

import type { Session } from "./types.js";

type TextNode = {
  type: "Text";
  value: string;
};

type InlineCodeNode = {
  type: "InlineCode";
  value: string;
  language?: string;
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type CodeExprNode = {
  type: "CodeExpr";
  code: string;
  language?: string;
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type FormattingNode = {
  type: "Strong" | "Emphasis" | "Superscript" | "Subscript";
  children: InlineNode[];
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type CiteNode = {
  type: "Cite";
  xref: string;
  children?: InlineNode[];
  prefix?: InlineNode[];
  suffix?: InlineNode[];
  display?: "author" | "date" | "full";
  locator?: string;
  url?: string;
  intent?: string;
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type CiteGroupNode = {
  type: "CiteGroup";
  kind: "narrative" | "parenthetical";
  children: CiteNode[];
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type InlineNode =
  | TextNode
  | InlineCodeNode
  | CodeExprNode
  | FormattingNode
  | CiteNode
  | CiteGroupNode;

type BlockNodeBase = {
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type ParagraphNode = BlockNodeBase & {
  type: "Paragraph";
  children: InlineNode[];
};

type HeadingNode = BlockNodeBase & {
  type: "Heading";
  level: number;
  children: InlineNode[];
};

type CodeNode = BlockNodeBase & {
  type: "Code";
  value: string;
  language?: string;
};

type CodeCellNode = BlockNodeBase & {
  type: "CodeCell";
  code: string;
  language?: string;
  isEchoed?: boolean;
  isHidden?: boolean;
};

type ThematicBreakNode = BlockNodeBase & {
  type: "ThematicBreak";
};

type ReferenceNode = BlockNodeBase & {
  type: "Reference";
  children?: InlineNode[];
  csl: Record<string, unknown>;
};

type UnknownBlockNode = BlockNodeBase & {
  type: string;
  children?: InlineNode[];
};

type BlockNode =
  | ParagraphNode
  | HeadingNode
  | CodeNode
  | CodeCellNode
  | ThematicBreakNode
  | ReferenceNode
  | UnknownBlockNode;

export type DocumentNode = {
  type: "Document";
  children: BlockNode[];
  title?: InlineNode[];
  metadata?: Record<string, unknown>;
};

interface FacetFeature {
  $type: string;
  [key: string]: unknown;
}

interface Facet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: FacetFeature[];
}

interface RichText {
  text: string;
  facets: Facet[];
}

type AtprotoParagraph = RichText &
  BlockNodeBase & {
    $type: "pub.oxa.blocks.defs#paragraph";
  };

type AtprotoHeading = RichText &
  BlockNodeBase & {
    $type: "pub.oxa.blocks.defs#heading";
    level: number;
  };

type AtprotoCode = BlockNodeBase & {
  $type: "pub.oxa.blocks.defs#code";
  value: string;
  language?: string;
};

type AtprotoCodeCell = BlockNodeBase & {
  $type: "pub.oxa.blocks.defs#codeCell";
  code: string;
  language?: string;
  isEchoed?: boolean;
  isHidden?: boolean;
};

type AtprotoThematicBreak = BlockNodeBase & {
  $type: "pub.oxa.blocks.defs#thematicBreak";
};

type AtprotoReference = BlockNodeBase & {
  $type: "pub.oxa.blocks.defs#reference";
  csl: Record<string, unknown>;
  text?: string;
  facets?: Facet[];
};

type AtprotoBlock =
  | AtprotoParagraph
  | AtprotoHeading
  | AtprotoCode
  | AtprotoCodeCell
  | AtprotoThematicBreak
  | AtprotoReference;

type AtprotoDocument = {
  $type: "pub.oxa.document";
  title?: RichText;
  metadata?: Record<string, unknown>;
  children: AtprotoBlock[];
  createdAt: string;
};

type OxaToAtprotoOptions = {
  createdAt?: string;
};

type FormattingPropertyName = "id" | "classes" | "data";
type BlockPropertyName = keyof BlockNodeBase;
type InlineMetadataNode = {
  type: string;
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};
type KnownBlockNode =
  | ParagraphNode
  | HeadingNode
  | CodeNode
  | CodeCellNode
  | ThematicBreakNode
  | ReferenceNode;

const facetFeatureTypes = {
  Cite: "pub.oxa.richtext.facet#cite",
  CiteGroup: "pub.oxa.richtext.facet#citeGroup",
  CodeExpr: "pub.oxa.richtext.facet#codeExpr",
  Strong: "pub.oxa.richtext.facet#strong",
  Emphasis: "pub.oxa.richtext.facet#emphasis",
  Superscript: "pub.oxa.richtext.facet#superscript",
  Subscript: "pub.oxa.richtext.facet#subscript",
  InlineCode: "pub.oxa.richtext.facet#inlineCode",
} as const;

/**
 * Compatible facet features from other AT Protocol namespaces.
 *
 * When an OXA facet feature has a semantically equivalent type in another
 * namespace (e.g. Bluesky's `app.bsky.richtext.facet`), the converter
 * emits both features in the same facet. This gives consumers that understand
 * the other namespace free interoperability without OXA depending on that
 * namespace for its core schema.
 *
 * Each key is an OXA facet feature `$type`. The value is an array of
 * functions that receive the OXA inline node and return a compatible
 * feature object (or `null` to skip).
 *
 * These lexicons should be checked periodically for new features that
 * could be mapped here:
 *   - Leaflet: https://github.com/hyperlink-academy/leaflet/blob/main/lexicons/pub/leaflet/richtext/facet.json
 *   - Bluesky: https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/richtext/facet.json
 */
export const compatibleFeatures: Record<
  string,
  Array<(node: Record<string, unknown>) => FacetFeature | null>
> = {
  "pub.oxa.richtext.facet#strong": [
    () => ({ $type: "pub.leaflet.richtext.facet#bold" }),
  ],
  "pub.oxa.richtext.facet#emphasis": [
    () => ({ $type: "pub.leaflet.richtext.facet#italic" }),
  ],
  "pub.oxa.richtext.facet#inlineCode": [
    () => ({ $type: "pub.leaflet.richtext.facet#code" }),
  ],
};

const formattingPropertyNames = ["id", "classes", "data"] as const;
const blockPropertyNames = ["id", "classes", "data"] as const;
const citeFeaturePropertyNames = [
  "xref",
  "display",
  "locator",
  "url",
  "intent",
] as const;
const paragraphType = "pub.oxa.blocks.defs#paragraph" as const;
const headingType = "pub.oxa.blocks.defs#heading" as const;
const codeType = "pub.oxa.blocks.defs#code" as const;
const codeCellType = "pub.oxa.blocks.defs#codeCell" as const;
const thematicBreakType = "pub.oxa.blocks.defs#thematicBreak" as const;
const referenceType = "pub.oxa.blocks.defs#reference" as const;

const encoder = new TextEncoder();

function byteLength(text: string): number {
  return encoder.encode(text).byteLength;
}

function getCurrentByteOffset(richText: RichText): number {
  return byteLength(richText.text);
}

function createInlineFeature(
  node: FormattingNode | InlineCodeNode | CodeExprNode,
): FacetFeature {
  const oxaType = facetFeatureTypes[node.type];

  if (node.type === "InlineCode") {
    return {
      $type: oxaType,
      ...copyDefinedProperties(node, ["value", "language"] as const),
    };
  }

  if (node.type === "CodeExpr") {
    return {
      $type: oxaType,
      ...copyDefinedProperties(node, ["code", "language"] as const),
    };
  }

  return { $type: oxaType };
}

function createFacet(
  node: FormattingNode | InlineCodeNode | CodeExprNode,
  byteStart: number,
  byteEnd: number,
): Facet {
  const oxaType = facetFeatureTypes[node.type];
  const features: FacetFeature[] = [createInlineFeature(node)];

  const compat = compatibleFeatures[oxaType];
  if (compat) {
    for (const toFeature of compat) {
      const extra = toFeature(node as unknown as Record<string, unknown>);
      if (extra) {
        features.push(extra);
      }
    }
  }

  return {
    index: { byteStart, byteEnd },
    features,
  };
}

function createCiteFacet(
  node: CiteNode,
  byteStart: number,
  byteEnd: number,
): Facet {
  return {
    index: { byteStart, byteEnd },
    features: [
      {
        $type: facetFeatureTypes.Cite,
        ...copyDefinedProperties(node, citeFeaturePropertyNames),
      },
    ],
  };
}

function createCiteGroupFacet(
  node: CiteGroupNode,
  byteStart: number,
  byteEnd: number,
): Facet {
  return {
    index: { byteStart, byteEnd },
    features: [
      {
        $type: facetFeatureTypes.CiteGroup,
        kind: node.kind,
      },
    ],
  };
}

function getDroppedFormattingProperties(
  node: InlineMetadataNode,
): FormattingPropertyName[] {
  return formattingPropertyNames.filter(
    (propertyName) => node[propertyName] !== undefined,
  );
}

function copyDefinedProperties<T extends object, K extends keyof T>(
  source: T,
  propertyNames: readonly K[],
): Pick<T, K> {
  const props = {} as Pick<T, K>;

  for (const propertyName of propertyNames) {
    const value = source[propertyName];

    if (value !== undefined) {
      props[propertyName] = value;
    }
  }

  return props;
}

function warnDroppedProperties(
  session: Session,
  node: InlineMetadataNode,
): void {
  const dropped = getDroppedFormattingProperties(node);

  if (dropped.length === 0) {
    return;
  }

  session.log.warn(
    `dropping unsupported inline properties on ${node.type}: ${dropped.join(", ")}`,
  );
}

function flattenNode(
  session: Session,
  node: InlineNode,
  richText: RichText,
): void {
  if (node.type === "Text") {
    richText.text += node.value;
    return;
  }

  if (node.type === "InlineCode") {
    warnDroppedProperties(session, node);
    const byteStart = getCurrentByteOffset(richText);
    richText.text += node.value;
    const byteEnd = getCurrentByteOffset(richText);
    richText.facets.push(createFacet(node, byteStart, byteEnd));
    return;
  }

  if (node.type === "CodeExpr") {
    warnDroppedProperties(session, node);
    const byteStart = getCurrentByteOffset(richText);
    richText.text += node.code;
    const byteEnd = getCurrentByteOffset(richText);
    richText.facets.push(createFacet(node, byteStart, byteEnd));
    return;
  }

  if (node.type === "Cite") {
    flattenCite(session, node, richText);
    return;
  }

  if (node.type === "CiteGroup") {
    flattenCiteGroup(session, node, richText);
    return;
  }

  warnDroppedProperties(session, node);

  const byteStart = getCurrentByteOffset(richText);

  for (const child of node.children) {
    flattenNode(session, child, richText);
  }

  const byteEnd = getCurrentByteOffset(richText);

  richText.facets.push(createFacet(node, byteStart, byteEnd));
}

function flattenOptionalInlines(
  session: Session,
  inlines: InlineNode[] | undefined,
  richText: RichText,
): void {
  for (const inline of inlines ?? []) {
    flattenNode(session, inline, richText);
  }
}

function appendText(richText: RichText, text: string): void {
  richText.text += text;
}

function flattenCite(
  session: Session,
  node: CiteNode,
  richText: RichText,
): void {
  const byteStart = getCurrentByteOffset(richText);

  flattenOptionalInlines(session, node.prefix, richText);

  if (node.children && node.children.length > 0) {
    flattenOptionalInlines(session, node.children, richText);
  } else {
    appendText(richText, `@${node.xref}`);
  }

  if (node.locator) {
    appendText(richText, `, ${node.locator}`);
  }

  flattenOptionalInlines(session, node.suffix, richText);

  const byteEnd = getCurrentByteOffset(richText);
  richText.facets.push(createCiteFacet(node, byteStart, byteEnd));
}

function flattenCiteGroup(
  session: Session,
  node: CiteGroupNode,
  richText: RichText,
): void {
  const byteStart = getCurrentByteOffset(richText);

  if (node.kind === "parenthetical") {
    appendText(richText, "(");
  }

  node.children.forEach((cite, index) => {
    if (index > 0) {
      appendText(richText, "; ");
    }
    flattenCite(session, cite, richText);
  });

  if (node.kind === "parenthetical") {
    appendText(richText, ")");
  }

  const byteEnd = getCurrentByteOffset(richText);
  richText.facets.push(createCiteGroupFacet(node, byteStart, byteEnd));
}

export function flattenInlines(
  session: Session,
  inlines: InlineNode[],
): RichText {
  const richText: RichText = {
    text: "",
    facets: [],
  };

  for (const inline of inlines) {
    flattenNode(session, inline, richText);
  }

  return richText;
}

function copyBlockProps(block: BlockNodeBase): BlockNodeBase {
  return copyDefinedProperties<BlockNodeBase, BlockPropertyName>(
    block,
    blockPropertyNames,
  );
}

type RichTextBlockNode = ParagraphNode | HeadingNode;

function mapBlockRichText(
  session: Session,
  block: RichTextBlockNode,
): BlockNodeBase & RichText {
  return {
    ...copyBlockProps(block),
    ...flattenInlines(session, block.children),
  };
}

function getOptionalDocumentFields(
  session: Session,
  document: DocumentNode,
): Partial<AtprotoDocument> {
  return {
    ...(document.title !== undefined
      ? { title: flattenInlines(session, document.title) }
      : {}),
    ...(document.metadata !== undefined ? { metadata: document.metadata } : {}),
  };
}

function isKnownBlock(block: BlockNode): block is KnownBlockNode {
  return (
    block.type === "Paragraph" ||
    block.type === "Heading" ||
    block.type === "Code" ||
    block.type === "CodeCell" ||
    block.type === "ThematicBreak" ||
    block.type === "Reference"
  );
}

function warnUnknownBlockType(session: Session, block: BlockNode): void {
  session.log.warn(`unknown block type: ${block.type}`);
}

function mapCodeBlock(block: CodeNode): AtprotoCode {
  const result: AtprotoCode = {
    $type: codeType,
    ...copyBlockProps(block),
    value: block.value,
  };
  if (block.language !== undefined) {
    result.language = block.language;
  }
  return result;
}

function mapCodeCell(block: CodeCellNode): AtprotoCodeCell {
  return {
    $type: codeCellType,
    ...copyBlockProps(block),
    code: block.code,
    ...(block.language !== undefined ? { language: block.language } : {}),
    ...(block.isEchoed !== undefined ? { isEchoed: block.isEchoed } : {}),
    ...(block.isHidden !== undefined ? { isHidden: block.isHidden } : {}),
  };
}

function mapThematicBreak(block: ThematicBreakNode): AtprotoThematicBreak {
  return {
    $type: thematicBreakType,
    ...copyBlockProps(block),
  };
}

function mapReference(
  session: Session,
  block: ReferenceNode,
): AtprotoReference {
  return {
    $type: referenceType,
    ...copyBlockProps(block),
    ...(block.children !== undefined
      ? flattenInlines(session, block.children)
      : {}),
    csl: block.csl,
  };
}

function mapKnownBlock(session: Session, block: KnownBlockNode): AtprotoBlock {
  if (block.type === "Code") {
    return mapCodeBlock(block);
  }

  if (block.type === "CodeCell") {
    return mapCodeCell(block);
  }

  if (block.type === "ThematicBreak") {
    return mapThematicBreak(block);
  }

  if (block.type === "Reference") {
    return mapReference(session, block);
  }

  const richTextBlock = mapBlockRichText(session, block);

  if (block.type === "Paragraph") {
    return {
      $type: paragraphType,
      ...richTextBlock,
    };
  }

  return {
    $type: headingType,
    ...richTextBlock,
    level: block.level,
  };
}

function mapKnownBlocks(session: Session, blocks: BlockNode[]): AtprotoBlock[] {
  return blocks.flatMap((block) => {
    const mapped = mapBlock(session, block);
    return mapped === undefined ? [] : [mapped];
  });
}

export function mapBlock(
  session: Session,
  block: BlockNode,
): AtprotoBlock | undefined {
  if (!isKnownBlock(block)) {
    warnUnknownBlockType(session, block);
    return undefined;
  }

  return mapKnownBlock(session, block);
}

export function oxaToAtproto(
  session: Session,
  document: DocumentNode,
  options: OxaToAtprotoOptions = {},
): AtprotoDocument {
  return {
    $type: "pub.oxa.document",
    ...getOptionalDocumentFields(session, document),
    children: mapKnownBlocks(session, document.children),
    createdAt: options.createdAt ?? new Date().toISOString(),
  };
}
