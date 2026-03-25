import type { NodeRenderers } from "../types";
import { DocumentRenderer } from "./Document";
import { HeadingRenderer } from "./Heading";
import { ParagraphRenderer } from "./Paragraph";
import { CodeRenderer } from "./Code";
import { ThematicBreakRenderer } from "./ThematicBreak";
import { TextRenderer } from "./Text";
import { EmphasisRenderer } from "./Emphasis";
import { StrongRenderer } from "./Strong";
import { InlineCodeRenderer } from "./InlineCode";
import { SubscriptRenderer } from "./Subscript";
import { SuperscriptRenderer } from "./Superscript";

export const defaultRenderers: NodeRenderers = {
  Document: DocumentRenderer,
  Heading: HeadingRenderer,
  Paragraph: ParagraphRenderer,
  Code: CodeRenderer,
  ThematicBreak: ThematicBreakRenderer,
  Text: TextRenderer,
  Emphasis: EmphasisRenderer,
  Strong: StrongRenderer,
  InlineCode: InlineCodeRenderer,
  Subscript: SubscriptRenderer,
  Superscript: SuperscriptRenderer,
};
