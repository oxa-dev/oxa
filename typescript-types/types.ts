/*
 * types.ts
 *
 * Copyright (C) 2025 Carlos Scheidegger
 * 
 * LICENSE: MIT
 */

export type URI = string; // in JSON schema this should be a validated string

/** =====================
 *  Common Primitive Aliases
 *  ===================== */
type URL = string;
type PositiveInteger = number;

/** =====================
 *  MediaObject
 *  ===================== */
export type MediaObject = Record<string, unknown> & {
  /** The bitrate of the media object. */
  bitrate?: number;

  /** File size in (mega/kilo)bytes. */
  contentSize: number;

  /** Actual bytes of the media object, e.g., the image or video file. */
  contentUrl?: URL;

  /**
   * Media type (MIME format, IANA/MDN ref). E.g., application/zip, audio/mpeg.
   * Can also be a URL describing the format.
   */
  encodingFormat?: Text | URL;

  /** Height of the item. */
  height?: number;

  /** Width of the item. */
  width?: number;

  /** Upload date. */
  uploadDate: string; // ISO date or date-time
}

/** =====================
 *  Identifier / OrganizationIdentifier
 *  ===================== */
export type Identifier = PropertyValue & {}

export type OrganizationIdentifier =
    | ISO6523Code
    | Ringgold
    | ResearchOrganizationRegistry
    | EIN
    | CaliforniaCorporationNumber
    | PropertyValue;

/** =====================
 *  Organization
 *  ===================== */
export type Organization = Record<string, unknown> & {
  /** Physical address of the item. */
  address?: PostalAddress;

  /** The name of the organization. */
  name: Text;

  /** Contact emails. */
  emails?: Email[];

  /** Identifiers for the organization. */
  identifiers: OrganizationIdentifier[];

  /** Parent organizations (supersedes branchOf). */
  parentOrganizations?: Organization[];

  /** An Organization to which this Organization belongs. */
  memberOf?: Organization[];

  /** Members (Persons or Organizations). */
  members?: Organization[];

  /** Sub-organizations (inverse of parentOrganizations). */
  subOrganization?: Organization[];
}

/** =====================
 *  Author and AuthorCRediT
 *  ===================== */
export type Author = Record<string, unknown> & {
  /** The creator of an item. */
  author: Organization | Person;

  /** Description of how a user contributed. */
  contributorRoles: (PropertyValue | AuthorCRediT)[];

  /** Order of appearance (tie-break by family name). */
  order?: PositiveInteger;
}

export enum AuthorCRediT {
  Conceptualization = "Conceptualization",
  Methodology = "Methodology",
  Software = "Software",
  Validation = "Validation",
  FormalAnalysis = "Formal analysis",
  Investigation = "Investigation",
  Resources = "Resources",
  DataCuration = "Data Curation",
  WritingOriginalDraft = "Writing - Original Draft",
  WritingReviewEditing = "Writing - Review & Editing",
  Visualization = "Visualization",
  Supervision = "Supervision",
  ProjectAdministration = "Project administration",
  FundingAcquisition = "Funding acquisition",
}

/** =====================
 *  Person
 *  ===================== */
export type Person = Record<string, unknown> & {
  /** Identifiers for a person. */
  identifiers?: PersonIdentifier[];

  /** Affiliations. */
  affiliations?: Affiliation[];

  /** Emails. */
  emails?: string[];

  /** Names the author is known by. */
  names: PersonName[];

  /** Physical address. */
  address?: PostalAddress;

  /** Known languages (IETF BCP 47 codes). */
  knowsLanguage?: Language;
}
export type Affiliation = Record<string, unknown> & {
  affiliate: Organization | Person;
  dateStart: string; // in JSON-schema this should be format date or date-time
  dateEnd?: string;  // in JSON-schema this should be format date or date-time
  affiliationType: string; // in JSON-schema this should have the description, "Describe the relationship to the item."
}

export type PersonName = Record<string, unknown> & {
  familyNames: string[];
  givenNames?: string[];
  honorificPrefixes?: string[];
  honorificSuffixes?: string[];
  order: number;
}

/** =====================
 *  Grant
 *  ===================== */
export type Grant = Record<string, unknown> & {
  /** Ways to identify the grant. */
  identifiers: PropertyValue[];

  /**
   * Something funded or sponsored through a Grant.
   * (inverse: funding)
   */
  fundedItem: ScholarlyWork | Person | Organization | Event | Product;

  /** The person or organization funding. */
  funder: Person | Organization;

  /** The monetary or non-monetary contribution. */
  funding: MonetaryAmount | Product | Service;

  /** Description of what the funding contributed towards. */
  description?: string;
}

/** =====================
 *  MonetaryAmount
 *  ===================== */
export type MonetaryAmount = Record<string, unknown> & {
  /** Currency, e.g., USD, BTC, etc. */
  currency: Text;

  /** The value of the monetary amount. */
  value: number | StructuredValue;
}

/** =====================
 *  Placeholder Types (referenced but not defined in YAML)
 *  ===================== */
export interface PropertyValue { [key: string]: any; }
export interface ISO6523Code { [key: string]: any; }
export interface Ringgold { [key: string]: any; }
export interface ResearchOrganizationRegistry { [key: string]: any; }
export interface EIN { [key: string]: any; }
export interface CaliforniaCorporationNumber { [key: string]: any; }
export interface PostalAddress { [key: string]: any; }
export interface Email { [key: string]: any; }
export interface PersonIdentifier { [key: string]: any; }
export interface Language { [key: string]: any; }
export interface ScholarlyWork { [key: string]: any; }
export interface Event { [key: string]: any; }
export interface Product { [key: string]: any; }
export interface Service { [key: string]: any; }
export interface StructuredValue { [key: string]: any; }


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
  mode: "AuthorInText" | "SupressAuthor" | "NormalCitation";
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
