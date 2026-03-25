import type { OxaNode } from "../types";
import { OXA } from "../oxa";

export function EmphasisRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <em className={className}>
      <OXA ast={node.children} />
    </em>
  );
}
