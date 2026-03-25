import type React from "react";

export interface OxaNode {
  type: string;
  children?: OxaNode[];
  value?: string;
  id?: string;
  classes?: string[];
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export type NodeRenderer<T = Record<string, unknown>> = React.FC<{
  node: OxaNode & T;
  className?: string;
}>;

export type NodeRenderers = Record<
  string,
  NodeRenderer | Record<"base" | string, NodeRenderer>
>;

export type NodeRenderersValidated = Record<
  string,
  { base: NodeRenderer } & Record<string, NodeRenderer>
>;
