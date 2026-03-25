import type { OxaNode } from "../types";
import { OXA } from "../oxa";

export function SuperscriptRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <sup className={className}>
      <OXA ast={node.children} />
    </sup>
  );
}
