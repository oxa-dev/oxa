import type { OxaNode } from "../types";

export function TextRenderer({ node }: { node: OxaNode }) {
  return <>{node.value}</>;
}
