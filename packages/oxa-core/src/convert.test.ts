import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { dirname, relative, resolve } from "path";
import { fileURLToPath } from "url";
import type { Session } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../../..");

function createTestSession(): Session & { messages: string[] } {
  const messages: string[] = [];
  return {
    messages,
    log: {
      debug: (...args: unknown[]) => messages.push(String(args.join(" "))),
      info: (...args: unknown[]) => messages.push(String(args.join(" "))),
      warn: (...args: unknown[]) => messages.push(String(args.join(" "))),
      error: (...args: unknown[]) => messages.push(String(args.join(" "))),
    },
  };
}

const lexiconFiles = {
  facet: {
    id: "pub.oxa.richtext.facet",
    path: resolve(REPO_ROOT, "lexicon/richtext/facet.json"),
  },
  defs: {
    id: "pub.oxa.blocks.defs",
    path: resolve(REPO_ROOT, "lexicon/blocks/defs.json"),
  },
  document: {
    id: "pub.oxa.document",
    path: resolve(REPO_ROOT, "lexicon/document/document.json"),
  },
} as const;

const facetFragments = [
  "emphasis",
  "inlineCode",
  "strong",
  "subscript",
  "superscript",
] as const;

const documentBlockRefs = [
  "#code",
  "#heading",
  "#paragraph",
  "#thematicBreak",
] as const;

const requiredDocumentDefs = [
  "richText",
  "code",
  "paragraph",
  "heading",
  "thematicBreak",
  "block",
] as const;

type LexiconDoc = {
  lexicon?: number;
  id?: string;
  defs?: Record<string, unknown>;
  [key: string]: unknown;
};

type TestTextNode = {
  type: "Text";
  value: string;
};

type TestFormattingNode = {
  type: "Strong" | "Emphasis";
  children: TestInlineNode[];
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type TestInlineNode = TestTextNode | TestFormattingNode;

type TestParagraphNode = {
  type: "Paragraph";
  children: TestInlineNode[];
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type TestHeadingNode = {
  type: "Heading";
  level: number;
  children: TestInlineNode[];
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
};

type TestBlockNode = TestParagraphNode | TestHeadingNode;

type TestDocumentNode = {
  type: "Document";
  children: TestBlockNode[];
  title?: TestInlineNode[];
  metadata?: Record<string, unknown>;
};

function text(value: string) {
  return { type: "Text", value } satisfies TestTextNode;
}

function strong(
  children: readonly TestInlineNode[],
  props: Omit<Partial<TestFormattingNode>, "type" | "children"> = {},
) {
  return {
    type: "Strong",
    children: [...children],
    ...props,
  } satisfies TestFormattingNode;
}

function emphasis(
  children: readonly TestInlineNode[],
  props: Omit<Partial<TestFormattingNode>, "type" | "children"> = {},
) {
  return {
    type: "Emphasis",
    children: [...children],
    ...props,
  } satisfies TestFormattingNode;
}

function paragraph(
  children: readonly TestInlineNode[],
  props: Omit<Partial<TestParagraphNode>, "type" | "children"> = {},
) {
  return {
    type: "Paragraph",
    children: [...children],
    ...props,
  } satisfies TestParagraphNode;
}

function heading(
  level: number,
  children: readonly TestInlineNode[],
  props: Omit<Partial<TestHeadingNode>, "type" | "level" | "children"> = {},
) {
  return {
    type: "Heading",
    level,
    children: [...children],
    ...props,
  } satisfies TestHeadingNode;
}

function documentNode(
  children: readonly TestBlockNode[],
  props: Omit<Partial<TestDocumentNode>, "type" | "children"> = {},
) {
  return {
    type: "Document",
    children: [...children],
    ...props,
  } satisfies TestDocumentNode;
}

async function flatten(inlines: unknown[], session?: Session) {
  const convertModule = await import("./convert.js").catch((error) => {
    if (error instanceof Error && error.message.includes("/src/convert.js")) {
      return undefined;
    }

    throw error;
  });

  const flattenInlines = convertModule?.flattenInlines;

  expect(
    flattenInlines,
    "Expected packages/oxa-core/src/convert.ts to export flattenInlines",
  ).toBeTypeOf("function");

  return flattenInlines!(session ?? createTestSession(), inlines as never);
}

async function map(block: unknown, session?: Session) {
  const convertModule = await import("./convert.js");
  const mapBlock = convertModule.mapBlock;

  expect(
    mapBlock,
    "Expected packages/oxa-core/src/convert.ts to export mapBlock",
  ).toBeTypeOf("function");

  return mapBlock!(session ?? createTestSession(), block as never);
}

async function convertDocument(
  document: unknown,
  options?: unknown,
  session?: Session,
) {
  const convertModule = await import("./convert.js");
  const oxaToAtproto = convertModule.oxaToAtproto;

  expect(
    oxaToAtproto,
    "Expected packages/oxa-core/src/convert.ts to export oxaToAtproto",
  ).toBeTypeOf("function");

  return oxaToAtproto!(
    session ?? createTestSession(),
    document as never,
    options as never,
  );
}

function readLexicon(filePath: string): LexiconDoc {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as LexiconDoc;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read or parse ${relative(REPO_ROOT, filePath)}: ${message}`,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLexiconDefs(filePath: string): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return readLexicon(filePath).defs as Record<string, any>;
}

function expectFragments(
  defs: Record<string, unknown>,
  fragments: readonly string[],
  messagePrefix: string,
) {
  for (const fragment of fragments) {
    expect(defs[fragment], `${messagePrefix} ${fragment}`).toBeDefined();
  }
}

function collectRefs(value: unknown, refs: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRefs(item, refs);
    }

    return refs;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.ref === "string") {
      refs.push(record.ref);
    }

    for (const nested of Object.values(record)) {
      collectRefs(nested, refs);
    }
  }

  return refs;
}

function resolveRef(
  source: LexiconDoc,
  ref: string,
  docs: Map<string, LexiconDoc>,
) {
  if (!source.id) {
    throw new Error("Source lexicon is missing an id");
  }

  const [targetId, fragment] = ref.startsWith("#")
    ? [source.id, ref.slice(1)]
    : ref.split("#", 2);

  const targetDoc = docs.get(targetId);
  expect(
    targetDoc,
    `Expected ref ${ref} to resolve to a known lexicon id`,
  ).toBeDefined();

  if (fragment) {
    expect(
      targetDoc?.defs?.[fragment],
      `Expected ref ${ref} to resolve to a defs fragment`,
    ).toBeDefined();
  }
}

describe("ATProto lexicon structure", () => {
  it("parses all Phase 1 lexicon files and gives them the expected lexicon ids", () => {
    for (const { id, path } of Object.values(lexiconFiles)) {
      const lexicon = readLexicon(path);

      expect(lexicon.lexicon).toBe(1);
      expect(lexicon.id).toBe(id);
      expect(lexicon.defs).toBeTypeOf("object");
    }
  });

  it("defines the richtext facet feature union and required feature fragments", () => {
    const defs = getLexiconDefs(lexiconFiles.facet.path);
    const featureUnion = defs.main.properties.features.items;

    expect(defs.byteSlice.required).toEqual(["byteStart", "byteEnd"]);
    expect(featureUnion.type).toBe("union");
    expect(featureUnion.closed).toBe(false);
    expect(featureUnion.refs).toEqual(
      facetFragments.map((fragment) => `#${fragment}`),
    );

    expectFragments(defs, facetFragments, "Missing facet fragment");
  });

  it("defines the shared document defs and open block unions", () => {
    const defs = getLexiconDefs(lexiconFiles.defs.path);

    expectFragments(defs, requiredDocumentDefs, "Missing defs fragment");

    expect(defs.richText.properties.facets.items.ref).toBe(
      "pub.oxa.richtext.facet",
    );
    expect(defs.block.type).toBe("union");
    expect(defs.block.closed).toBe(false);
    expect(defs.block.refs).toEqual(documentBlockRefs);
  });

  it("defines the top-level document record against the shared rich text and block defs", () => {
    const main = getLexiconDefs(lexiconFiles.document.path).main;
    const record = main.record;

    expect(main.type).toBe("record");
    expect(main.key).toBe("tid");
    expect(record.required).toEqual(["children", "createdAt"]);
    expect(record.properties.title.ref).toBe("pub.oxa.blocks.defs#richText");
    expect(record.properties.children.items.ref).toBe(
      "pub.oxa.blocks.defs#block",
    );
    expect(record.properties.createdAt).toEqual({
      type: "string",
      format: "datetime",
    });
  });

  it("resolves every local and cross-file ref to a known lexicon definition", () => {
    const docs = new Map<string, LexiconDoc>(
      Object.values(lexiconFiles).map(({ id, path }) => [
        id,
        readLexicon(path),
      ]),
    );

    for (const lexicon of docs.values()) {
      for (const ref of collectRefs(lexicon)) {
        resolveRef(lexicon, ref, docs);
      }
    }
  });
});

describe("mapBlock", () => {
  it("maps a Paragraph block to an ATProto paragraph preserving id, classes, and data", async () => {
    const block = paragraph(
      [text("Hello "), strong([text("bold")]), text(" text")],
      {
        id: "para-1",
        classes: ["lead"],
        data: { align: "left" },
      },
    );

    await expect(map(block)).resolves.toEqual({
      $type: "pub.oxa.blocks.defs#paragraph",
      id: "para-1",
      classes: ["lead"],
      data: { align: "left" },
      text: "Hello bold text",
      facets: [
        {
          index: { byteStart: 6, byteEnd: 10 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
      ],
    });
  });

  it("maps a Heading block to an ATProto heading with level and flattened rich text", async () => {
    const block = heading(2, [text("Read "), emphasis([text("this")])], {
      id: "intro",
      classes: ["hero"],
      data: { section: true },
    });

    await expect(map(block)).resolves.toEqual({
      $type: "pub.oxa.blocks.defs#heading",
      id: "intro",
      classes: ["hero"],
      data: { section: true },
      level: 2,
      text: "Read this",
      facets: [
        {
          index: { byteStart: 5, byteEnd: 9 },
          features: [
            { $type: "pub.oxa.richtext.facet#emphasis" },
            { $type: "pub.leaflet.richtext.facet#italic" },
          ],
        },
      ],
    });
  });

  it("warns and omits unknown block types instead of coercing them into known ATProto blocks", async () => {
    const session = createTestSession();

    const result = await map(
      {
        type: "Callout",
        children: [text("Should be dropped")],
        id: "callout-1",
        classes: ["note"],
        data: { severity: "warning" },
      },
      session,
    );

    expect(result).toBeUndefined();
    expect(session.messages.length).toBeGreaterThan(0);

    const warning = session.messages.join("\n");
    expect(warning).toContain("unknown block type");
    expect(warning).toContain("Callout");
  });
});

describe("oxaToAtproto", () => {
  it("builds a complete ATProto document with title, metadata, mapped children, and deterministic createdAt", async () => {
    const createdAt = "2026-03-22T00:00:00.000Z";
    const document = documentNode(
      [
        heading(1, [text("Introduction")]),
        paragraph([
          text("This is "),
          strong([text("bold")]),
          text(" and "),
          emphasis([text("italic")]),
          text(" text."),
        ]),
      ],
      {
        title: [text("Hello, World")],
        metadata: {
          license: "CC-BY-4.0",
          author: "Jane Doe",
        },
      },
    );

    await expect(convertDocument(document, { createdAt })).resolves.toEqual({
      $type: "pub.oxa.document",
      title: {
        text: "Hello, World",
        facets: [],
      },
      metadata: {
        license: "CC-BY-4.0",
        author: "Jane Doe",
      },
      children: [
        {
          $type: "pub.oxa.blocks.defs#heading",
          level: 1,
          text: "Introduction",
          facets: [],
        },
        {
          $type: "pub.oxa.blocks.defs#paragraph",
          text: "This is bold and italic text.",
          facets: [
            {
              index: { byteStart: 8, byteEnd: 12 },
              features: [
                { $type: "pub.oxa.richtext.facet#strong" },
                { $type: "pub.leaflet.richtext.facet#bold" },
              ],
            },
            {
              index: { byteStart: 17, byteEnd: 23 },
              features: [
                { $type: "pub.oxa.richtext.facet#emphasis" },
                { $type: "pub.leaflet.richtext.facet#italic" },
              ],
            },
          ],
        },
      ],
      createdAt,
    });
  });

  it("builds a minimal ATProto document when title and metadata are absent", async () => {
    const createdAt = "2026-01-01T00:00:00.000Z";

    await expect(
      convertDocument(documentNode([]), { createdAt }),
    ).resolves.toEqual({
      $type: "pub.oxa.document",
      children: [],
      createdAt,
    });
  });

  it("omits title when absent, preserves metadata unchanged, and drops unknown child blocks with a warning", async () => {
    const createdAt = "2026-03-22T00:00:00.000Z";
    const metadata = {
      license: "CC-BY-4.0",
      nested: {
        tags: ["oxa", "atproto"],
      },
    };
    const session = createTestSession();

    const converted = await convertDocument(
      {
        type: "Document",
        metadata,
        children: [
          paragraph([text("Keep this paragraph")]),
          {
            type: "Callout",
            children: [text("Drop this block")],
            data: { severity: "warning" },
          },
        ],
      },
      { createdAt },
      session,
    );

    expect(converted).toEqual({
      $type: "pub.oxa.document",
      metadata,
      children: [
        {
          $type: "pub.oxa.blocks.defs#paragraph",
          text: "Keep this paragraph",
          facets: [],
        },
      ],
      createdAt,
    });
    expect(converted.metadata).toBe(metadata);
    expect("title" in converted).toBe(false);

    expect(session.messages.length).toBeGreaterThan(0);

    const warning = session.messages.join("\n");
    expect(warning).toContain("unknown block type");
    expect(warning).toContain("Callout");
  });
});

describe("flattenInlines", () => {
  it("concatenates plain text children and emits no facets", async () => {
    const richText = await flatten([
      text("Hello"),
      text(", "),
      text("world"),
      text("!"),
    ]);

    expect(richText).toEqual({
      text: "Hello, world!",
      facets: [],
    });
  });

  it("emits a strong facet for a single strong node", async () => {
    const richText = await flatten([text("Hello "), strong([text("world")])]);

    expect(richText).toEqual({
      text: "Hello world",
      facets: [
        {
          index: { byteStart: 6, byteEnd: 11 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
      ],
    });
  });

  it("emits strong and emphasis facets with the expected byte ranges", async () => {
    const richText = await flatten([
      text("This is "),
      strong([text("bold")]),
      text(" and "),
      emphasis([text("italic")]),
      text(" text."),
    ]);

    expect(richText).toEqual({
      text: "This is bold and italic text.",
      facets: [
        {
          index: { byteStart: 8, byteEnd: 12 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
        {
          index: { byteStart: 17, byteEnd: 23 },
          features: [
            { $type: "pub.oxa.richtext.facet#emphasis" },
            { $type: "pub.leaflet.richtext.facet#italic" },
          ],
        },
      ],
    });
  });

  it("uses UTF-8 byte offsets for formatted multibyte text", async () => {
    const richText = await flatten([text("Say "), emphasis([text("café")])]);

    expect(richText).toEqual({
      text: "Say café",
      facets: [
        {
          index: { byteStart: 4, byteEnd: 9 },
          features: [
            { $type: "pub.oxa.richtext.facet#emphasis" },
            { $type: "pub.leaflet.richtext.facet#italic" },
          ],
        },
      ],
    });
  });

  it("treats multiple text children inside formatting nodes as one continuous facet span", async () => {
    const richText = await flatten([
      text("Start "),
      strong([text("very"), text(" bold")]),
      text(" and "),
      emphasis([text("quite"), text(" italic")]),
    ]);

    expect(richText).toEqual({
      text: "Start very bold and quite italic",
      facets: [
        {
          index: { byteStart: 6, byteEnd: 15 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
        {
          index: { byteStart: 20, byteEnd: 32 },
          features: [
            { $type: "pub.oxa.richtext.facet#emphasis" },
            { $type: "pub.leaflet.richtext.facet#italic" },
          ],
        },
      ],
    });
  });

  it("returns an empty rich text result for empty input", async () => {
    await expect(flatten([])).resolves.toEqual({
      text: "",
      facets: [],
    });
  });

  it("emits overlapping facets for nested strong and emphasis nodes", async () => {
    const richText = await flatten([
      strong([text("bold and "), emphasis([text("bold-italic")])]),
    ]);

    expect(richText.text).toBe("bold and bold-italic");
    expect(richText.facets).toHaveLength(2);
    expect(richText.facets).toEqual(
      expect.arrayContaining([
        {
          index: { byteStart: 0, byteEnd: 20 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
        {
          index: { byteStart: 9, byteEnd: 20 },
          features: [
            { $type: "pub.oxa.richtext.facet#emphasis" },
            { $type: "pub.leaflet.richtext.facet#italic" },
          ],
        },
      ]),
    );
  });

  it("computes UTF-8 byte offsets for 4-byte characters inside formatting spans", async () => {
    const richText = await flatten([emphasis([text("🧪test")])]);

    expect(richText).toEqual({
      text: "🧪test",
      facets: [
        {
          index: { byteStart: 0, byteEnd: 8 },
          features: [
            { $type: "pub.oxa.richtext.facet#emphasis" },
            { $type: "pub.leaflet.richtext.facet#italic" },
          ],
        },
      ],
    });
  });

  it("emits compatible features from other namespaces alongside OXA features", async () => {
    const { compatibleFeatures } = await import("./convert.js");
    const saved = { ...compatibleFeatures };

    compatibleFeatures["pub.oxa.richtext.facet#strong"] = [
      () => ({ $type: "com.example.richtext.facet#bold" }),
    ];

    try {
      const richText = await flatten([text("a "), strong([text("b")])]);

      expect(richText).toEqual({
        text: "a b",
        facets: [
          {
            index: { byteStart: 2, byteEnd: 3 },
            features: [
              { $type: "pub.oxa.richtext.facet#strong" },
              { $type: "com.example.richtext.facet#bold" },
            ],
          },
        ],
      });
    } finally {
      for (const key of Object.keys(compatibleFeatures)) {
        delete compatibleFeatures[key];
      }
      Object.assign(compatibleFeatures, saved);
    }
  });

  it("skips compatible features that return null", async () => {
    const { compatibleFeatures } = await import("./convert.js");
    const saved = { ...compatibleFeatures };

    compatibleFeatures["pub.oxa.richtext.facet#emphasis"] = [
      () => null,
      () => ({ $type: "com.example.richtext.facet#italic" }),
    ];

    try {
      const richText = await flatten([emphasis([text("x")])]);

      expect(richText.facets[0].features).toEqual([
        { $type: "pub.oxa.richtext.facet#emphasis" },
        { $type: "com.example.richtext.facet#italic" },
      ]);
    } finally {
      for (const key of Object.keys(compatibleFeatures)) {
        delete compatibleFeatures[key];
      }
      Object.assign(compatibleFeatures, saved);
    }
  });

  it("handles deeply nested formatting with overlapping facet ranges", async () => {
    const richText = await flatten([
      strong([
        text("deep "),
        emphasis([text("nest "), strong([text("core")])]),
      ]),
    ]);

    expect(richText.text).toBe("deep nest core");
    expect(richText.facets).toHaveLength(3);
    expect(richText.facets).toEqual(
      expect.arrayContaining([
        {
          index: { byteStart: 0, byteEnd: 14 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
        {
          index: { byteStart: 5, byteEnd: 14 },
          features: [
            { $type: "pub.oxa.richtext.facet#emphasis" },
            { $type: "pub.leaflet.richtext.facet#italic" },
          ],
        },
        {
          index: { byteStart: 10, byteEnd: 14 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
      ]),
    );
  });

  it("warns and drops inline id, classes, and data properties on formatting nodes", async () => {
    const session = createTestSession();

    const richText = await flatten(
      [
        strong([text("styled")], {
          id: "inline-id",
          classes: ["callout", "accent"],
          data: { note: "keep warning only" },
        }),
      ],
      session,
    );

    expect(richText).toEqual({
      text: "styled",
      facets: [
        {
          index: { byteStart: 0, byteEnd: 6 },
          features: [
            { $type: "pub.oxa.richtext.facet#strong" },
            { $type: "pub.leaflet.richtext.facet#bold" },
          ],
        },
      ],
    });

    expect(session.messages.length).toBeGreaterThan(0);

    const warning = session.messages.join("\n");
    expect(warning).toContain("Strong");
    expect(warning).toContain("id");
    expect(warning).toContain("classes");
    expect(warning).toContain("data");
  });
});
