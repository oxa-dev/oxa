import type { NodeRenderers } from "../types";
import { DocumentRenderer } from "./Document";
import { HeadingRenderer } from "./Heading";
import { ParagraphRenderer } from "./Paragraph";
import { CodeRenderer } from "./Code";
import { CodeCellRenderer } from "./CodeCell";
import { CodeExprRenderer } from "./CodeExpr";
import { ThematicBreakRenderer } from "./ThematicBreak";
import { TextRenderer } from "./Text";
import { EmphasisRenderer } from "./Emphasis";
import { StrongRenderer } from "./Strong";
import { InlineCodeRenderer } from "./InlineCode";
import { SubscriptRenderer } from "./Subscript";
import { SuperscriptRenderer } from "./Superscript";
import { CiteRenderer } from "./Cite";
import { CiteGroupRenderer } from "./CiteGroup";
import { ReferenceRenderer } from "./Reference";

export const defaultRenderers: NodeRenderers = {
  Cite: CiteRenderer,
  CiteGroup: CiteGroupRenderer,
  Document: DocumentRenderer,
  Heading: HeadingRenderer,
  Paragraph: ParagraphRenderer,
  Reference: ReferenceRenderer,
  Code: CodeRenderer,
  CodeCell: CodeCellRenderer,
  CodeExpr: CodeExprRenderer,
  ThematicBreak: ThematicBreakRenderer,
  Text: TextRenderer,
  Emphasis: EmphasisRenderer,
  Strong: StrongRenderer,
  InlineCode: InlineCodeRenderer,
  Subscript: SubscriptRenderer,
  Superscript: SuperscriptRenderer,
};
