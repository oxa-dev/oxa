/**
 * Minimal inline conversion helpers for OXA rich text.
 */

type TextNode = {
  type: "Text";
  value: string;
};

type FormattingNode = {
  type: "Strong" | "Emphasis";
  children: InlineNode[];
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type InlineNode = TextNode | FormattingNode;

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

type UnknownBlockNode = BlockNodeBase & {
  type: string;
  children?: InlineNode[];
};

type BlockNode = ParagraphNode | HeadingNode | UnknownBlockNode;

export type DocumentNode = {
  type: "Document";
  children: BlockNode[];
  title?: InlineNode[];
  metadata?: Record<string, unknown>;
};

interface FacetFeature {
  $type: "dev.oxa.richtext.facet#strong" | "dev.oxa.richtext.facet#emphasis";
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
    $type: "dev.oxa.document.defs#paragraph";
  };

type AtprotoHeading = RichText &
  BlockNodeBase & {
    $type: "dev.oxa.document.defs#heading";
    level: number;
  };

type AtprotoBlock = AtprotoParagraph | AtprotoHeading;

type AtprotoDocument = {
  $type: "dev.oxa.document.document";
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
type KnownBlockNode = ParagraphNode | HeadingNode;

const facetFeatureTypes = {
  Strong: "dev.oxa.richtext.facet#strong",
  Emphasis: "dev.oxa.richtext.facet#emphasis",
} as const;

const formattingPropertyNames = ["id", "classes", "data"] as const;
const blockPropertyNames = ["id", "classes", "data"] as const;
const paragraphType = "dev.oxa.document.defs#paragraph" as const;
const headingType = "dev.oxa.document.defs#heading" as const;

const encoder = new TextEncoder();

function byteLength(text: string): number {
  return encoder.encode(text).byteLength;
}

function getCurrentByteOffset(richText: RichText): number {
  return byteLength(richText.text);
}

function createFacet(
  node: FormattingNode,
  byteStart: number,
  byteEnd: number,
): Facet {
  return {
    index: { byteStart, byteEnd },
    features: [{ $type: facetFeatureTypes[node.type] }],
  };
}

function warn(message: string): void {
  process.stderr.write(`Warning: ${message}\n`);
}

function getDroppedFormattingProperties(
  node: FormattingNode,
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

function warnDroppedProperties(node: FormattingNode): void {
  const dropped = getDroppedFormattingProperties(node);

  if (dropped.length === 0) {
    return;
  }

  warn(
    `dropping unsupported inline properties on ${node.type}: ${dropped.join(", ")}`,
  );
}

function flattenNode(node: InlineNode, richText: RichText): void {
  if (node.type === "Text") {
    richText.text += node.value;
    return;
  }

  warnDroppedProperties(node);

  const byteStart = getCurrentByteOffset(richText);

  for (const child of node.children) {
    flattenNode(child, richText);
  }

  const byteEnd = getCurrentByteOffset(richText);

  richText.facets.push(createFacet(node, byteStart, byteEnd));
}

export function flattenInlines(inlines: InlineNode[]): RichText {
  const richText: RichText = {
    text: "",
    facets: [],
  };

  for (const inline of inlines) {
    flattenNode(inline, richText);
  }

  return richText;
}

function copyBlockProps(block: BlockNodeBase): BlockNodeBase {
  return copyDefinedProperties<BlockNodeBase, BlockPropertyName>(
    block,
    blockPropertyNames,
  );
}

function mapBlockRichText(block: KnownBlockNode): BlockNodeBase & RichText {
  return {
    ...copyBlockProps(block),
    ...flattenInlines(block.children),
  };
}

function getOptionalDocumentFields(
  document: DocumentNode,
): Partial<AtprotoDocument> {
  return {
    ...(document.title !== undefined
      ? { title: flattenInlines(document.title) }
      : {}),
    ...(document.metadata !== undefined ? { metadata: document.metadata } : {}),
  };
}

function isKnownBlock(block: BlockNode): block is KnownBlockNode {
  return block.type === "Paragraph" || block.type === "Heading";
}

function warnUnknownBlockType(block: BlockNode): void {
  warn(`unknown block type: ${block.type}`);
}

function mapKnownBlock(block: KnownBlockNode): AtprotoBlock {
  const richTextBlock = mapBlockRichText(block);

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

function mapKnownBlocks(blocks: BlockNode[]): AtprotoBlock[] {
  return blocks.flatMap((block) => {
    const mapped = mapBlock(block);
    return mapped === undefined ? [] : [mapped];
  });
}

export function mapBlock(block: BlockNode): AtprotoBlock | undefined {
  if (!isKnownBlock(block)) {
    warnUnknownBlockType(block);
    return undefined;
  }

  return mapKnownBlock(block);
}

export function oxaToAtproto(
  document: DocumentNode,
  options: OxaToAtprotoOptions = {},
): AtprotoDocument {
  return {
    $type: "dev.oxa.document.document",
    ...getOptionalDocumentFields(document),
    children: mapKnownBlocks(document.children),
    createdAt: options.createdAt ?? new Date().toISOString(),
  };
}
