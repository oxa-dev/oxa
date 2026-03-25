import type { OxaNode } from "../types";
import { OXA } from "../oxa";

export function StrongRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <strong className={className}>
      <OXA ast={node.children} />
    </strong>
  );
}
