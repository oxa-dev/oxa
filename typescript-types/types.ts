/*
 * types.ts
 *
 * Copyright (C) 2025 Carlos Scheidegger
 * 
 * LICENSE: MIT
 */

/** =====================
 *  Common Primitive Aliases
 *  ===================== */

export type URI = string; // in JSON schema this should be a validated string

/**
 * An item which allows flexible and descriptive values.
 */
export interface PropertyValue {
  type: "PropertyValue";

  propertyId: string;

  value: any;
}

/** =====================
 *  MediaObject
 *  ===================== */
export type MediaObject = Record<string, unknown> & {
  type: "MediaObject"

  /** Actual bytes of the media object, e.g., the image or video file. */
  contentUri: URI;
}

/** =====================
 *  Organization
 *  ===================== */
export type Organization = Record<string, unknown> & {
  type: "Organization"

  /** Physical address of the item. */
  address?: PostalAddress;

  /** The URI(s) associated with this organization. */
  uris?: URI[]

  /** The name of the organization. */
  name: string;

  /** Contact emails. */
  emails?: string[]; // In JSON-schema this should be of format "email".

  /** Identifiers for the organization. */
  identifiers: PropertyValue[];

  /** Parent organizations (supersedes branchOf). */
  parentOrganizations?: Organization[];

  /** An Organization to which this Organization belongs. */
  memberOf?: Organization[];

  /** Members (Persons or Organizations). */
  members?: (Person | Organization)[];

  /** Sub-organizations (inverse of parentOrganizations). */
  subOrganization?: Organization[];
}

/** =====================
 *  Author and AuthorCRediT
 *  ===================== */
export type Author = Record<string, unknown> & {
  type: "Author"

  /** The creator of an item. */
  author: Organization | Person;

  /** Description of how a user contributed. */
  contributorRoles: (PropertyValue | AuthorCRediT)[];

  /** Order of appearance (tie-break by family name). */
  order?: number; // In JSON-schema this should have a minimum of 0.
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
  type: "Person"

  /** Identifiers for a person. */
  identifiers?: PropertyValue[];

  /** Affiliations. */
  affiliations?: Affiliation[];

  /** Emails. */
  emails?: string[]; // In JSON-schema this should have a format of email.

  /** Names the author is known by. */
  names: PersonName[];

  /** Physical address. */
  address?: PostalAddress;
}

/**
 * The affiliation between people and organziations.
 */
export type Affiliation = Record<string, unknown> & {
  type: "Affiliation"

  /** The Organization or Person itself. */
  affiliate: Organization | Person;

  /** The date the affiliation to this item began. */
  dateStart?: string; // in JSON-schema this should be format date or date-time

  /** The date the affiliation to this item ended. Leave blank to indicate the affiliation is current. */
  dateEnd?: string;  // in JSON-schema this should be format date or date-time

  /** Describe the relationship to the item. */
  affiliationType: string; // in JSON-schema this should have the description, "Describe the relationship to the item."
}

/**
 * The name of a Person object.
 */
export type PersonName = Record<string, unknown> & {
  type: "PersonName"

  /** Family name. In the U.S., the last name of a Person. */
  familyNames?: string[];

  /** Given name. In the U.S., the first name of a Person. */
  givenNames?: string[];

  /** An honorific prefix preceding a Person's name such as Dr/Mrs/Mr. */
  honorificPrefixes?: string[];

  /** An honorific suffix following a Person's name such as M.D./PhD/MSCSW. */
  honorificSuffixes?: string[];
}

/** =====================
 *  Funding information block.
 *  ===================== */
/**
 * The source of funding for a scholarly work.
 */
export type FundingSource = Record<string, unknown> & {
  type: "FundingSource"

  /** Ways to identify the grant. */
  identifiers?: PropertyValue[];

  /** The person or organization funding. */
  funder: Person | Organization;

  /** The monetary or non-monetary contribution. */
  funding: MonetaryAmount | Product | Service;

  /** Description of what the funding contributed towards. */
  description?: string;
}

/**
 * The way to connect a funding source to its funded item.
 */
export type Grant = FundingSource & {
  type: "Grant";

  /**
   * Something funded or sponsored through a Grant.
   */
  fundedItem: ScholarlyWork | Person | Organization | Event | Product;
}

/** =====================
 *  MonetaryAmount
 *  ===================== */
export type MonetaryAmount = Record<string, unknown> & {
  type: "MonetaryAmount";

  /** Currency, e.g., USD, BTC, etc. */
  currency: string;

  /** The value of the monetary amount. */
  value: number;
}

/** =====================
 *  Placeholder Types (referenced but not defined in YAML)
 *  ===================== */


export interface PostalAddress { [key: string]: any; }
export interface ScholarlyWork { [key: string]: any; }
export interface Event { [key: string]: any; }
export interface Product { [key: string]: any; }
export interface Service { [key: string]: any; }


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
