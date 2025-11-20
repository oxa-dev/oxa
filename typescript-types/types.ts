/*
 * types.ts
 *
 * Copyright (C) 2025 Carlos Scheidegger
 * 
 * LICENSE: MIT
 */

export type Author = Record<string, unknown> & {};

export type URI = string; // in JSON schema this should be a validated string

export type License = {
  uri?: URI; // link to full version of license if short name provided
  name?: string; // short name (eg "CC-BY-SA 3.0", "MIT")
  text?: string; // full text of license if nonstandard, allowed but not encouraged
};

export type OxaMetadata = Record<string, unknown> & {
  license?: License;
  author?: Author[];
};

export type Attr = {
  id?: string;
  classes: string[];
  data: OxaMetadata;
};

export type Text = Attr & {
  type: "Text";
  value: string;
};

type SimpleInline<T extends string> = Attr & {
  type: T;
  children: Inline[];
};

export type QuoteMark = "Single" | "Double"; // guillemets, etc etc
export type Strong = SimpleInline<"Strong">;
export type Emphasis = SimpleInline<"Emphasis">;
export type Strikeout = SimpleInline<"Strikeout">;
export type Superscript = SimpleInline<"Superscript">;
export type Subscript = SimpleInline<"Subscript">;
export type SmallCaps = SimpleInline<"SmallCaps">;
export type Underline = SimpleInline<"Underline">;
export type Span = SimpleInline<"Span">;

export type InlineQuote = Attr & {
  children: Inline[];
  mark: QuoteMark;
  type: "InlineQuote";
};

export type DisplayMath = Attr & {
  type: "DisplayMath";
  value: string;
};

export type InlineMath = Attr & {
  type: "InlineMath";
  value: string;
};

export type Image = Attr & {
  children: Inline[];
  title: string;
  type: "Image";
  uri: URI;
};

export type Link = Attr & {
  children: Inline[];
  title: string;
  type: "Link";
  uri: URI;
};

export type Citation = Attr & {
  mode: "AuthorInText" | "SuppressAuthor" | "NormalCitation";
  prefix: Inline[];
  suffix: Inline[];
};

export type Cite = Attr & {
  children: Inline[];
  citations: Citation[];
  type: "Cite";
};

export type InlinePanel = Attr & {
  caption?: Caption;
  kind: string;
  children: Inline[];
};

export type Inline =
  | Cite
  | DisplayMath
  | Emphasis
  | Image
  | InlineMath
  | Link
  | InlinePanel
  | InlineQuote
  | SmallCaps
  | Span
  | Strikeout
  | Strong
  | Subscript
  | Superscript
  | Text
  | Underline;

type SimpleInlineBlock<T extends string> = Attr & {
  children: Inline[];
  type: T;
};

export type Paragraph = SimpleInlineBlock<"Paragraph">;
export type Plain = SimpleInlineBlock<"Plain">;
export type Div = Attr & {
  children: Block[];
  type: "Div";
};

export type BlockQuote = Attr & {
  children: Block[];
  type: "BlockQuote";
};

export type Heading = Attr & {
  type: "Heading";
  children: Inline[];
  level: number;
};

export type CodeBlock = Attr & {
  value: string;
  type: "CodeBlock";
};

export type Section = Attr & {
  type: "Section";
  children: Block[];
};

export type Caption = {
  short?: Inline[]; // for use in "list of figures", "list of tables", etc.
  long?: Block[];
};

export type ColumnAlignment = "left" | "right" | "center" | "default";

export type ColumnSpec = Record<string, unknown> & {
  alignment?: ColumnAlignment; // undefined implies "default";
  width?: number; // fraction of container width between 0 and 1
};

export type CellSpec = ColumnSpec & {
  columnSpan: number; // integer
  rowSpan: number; // integer
};

export type TableAttr = Attr & {
  data: ColumnSpec;
};

export type CellAttr = TableAttr & {
  data: CellSpec;
};

export type TableCell = CellAttr & {
  children: Block[];
};

export type TableRow = TableAttr & {
  cells: TableCell[];
};

export type TableHead = TableAttr & {
  rows: TableRow[];
};

export type Table = TableAttr & {
  caption: Caption;
  columnSpecs: ColumnSpec[];
  head: TableHead;
};

export type BlockPanel = Attr & {
  caption?: Caption;
  kind: string;
  children: Block[];
};

export type Block =
  | Section
  | BlockPanel
  | BlockQuote
  | CodeBlock
  | Div
  | Heading
  | Paragraph
  | Table
  | Plain;

export type Document = {
  metadata: Record<string, unknown>;
  title: Inline[];
  children: Block[];
};
