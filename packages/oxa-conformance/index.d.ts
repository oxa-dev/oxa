/**
 * Type declarations for @oxa/conformance
 *
 * AUTO-GENERATED from JSON schemas - do not edit directly.
 * Run `pnpm codegen conformance` to regenerate.
 */

/**
 * A test case for validating OXA format conversions
 */
export interface OXAConformanceTestCase {
  /**
   * Reference to this schema
   */
  $schema?: string;
  /**
   * Short title describing the test case
   */
  title: string;
  /**
   * Detailed description of what the test case validates
   */
  description?: string;
  /**
   * Category of the test case
   */
  category: "inline" | "block" | "document";
  /**
   * Format representations of the same content. OXA is always required and should be first.
   */
  formats: {
    /**
     * OXA JSON representation (required, authoritative)
     */
    oxa: {
      [k: string]: unknown;
    };
    /**
     * MyST Markdown AST representation
     */
    "myst-ast"?: {
      [k: string]: unknown;
    };
    /**
     * Pandoc AST JSON representation
     */
    "pandoc-types"?: {
      [k: string]: unknown;
    };
    /**
     * Stencila Schema JSON representation
     */
    "stencila-schema"?: {
      [k: string]: unknown;
    };
    /**
     * CommonMark/GFM Markdown representation
     */
    markdown?: string;
    /**
     * MyST Markdown representation
     */
    "myst-markdown"?: string;
    /**
     * Stencila Markdown representation
     */
    "stencila-markdown"?: string;
    /**
     * Quarto Markdown representation
     */
    "quarto-markdown"?: string;
    /**
     * Semantic HTML5 representation
     */
    html?: string;
    /**
     * JATS Publishing XML representation
     */
    jats?: string;
  };
  /**
   * Format-specific notes and considerations
   */
  notes?: {
    [k: string]: string;
  };
}

/**
 * Index of all test cases in the OXA Conformance Suite
 */
export interface OXAConformanceSuiteManifest {
  /**
   * Reference to this schema
   */
  $schema?: string;
  /**
   * Version of the conformance suite
   */
  version: string;
  /**
   * List of supported formats in canonical order
   */
  formats: (
    | "oxa"
    | "myst-ast"
    | "pandoc-types"
    | "stencila-schema"
    | "markdown"
    | "myst-markdown"
    | "stencila-markdown"
    | "quarto-markdown"
    | "html"
    | "jats"
  )[];
  /**
   * List of all test cases
   */
  cases: {
    /**
     * Unique identifier for the test case (derived from filename)
     */
    id: string;
    /**
     * Relative path to the test case file
     */
    path: string;
    /**
     * Category of the test case
     */
    category: "inline" | "block" | "document" | "edge-case";
    /**
     * OXA node types covered by this test case
     */
    nodeTypes: string[];
  }[];
}

// Friendly type aliases
export type TestCase = OXAConformanceTestCase;
export type Manifest = OXAConformanceSuiteManifest;
export type ManifestCase = Manifest["cases"][number];

export declare const manifest: Manifest;

export declare const cases: Record<string, TestCase>;
