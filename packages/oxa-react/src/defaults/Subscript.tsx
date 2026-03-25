import type { OxaNode } from "../types";
import { OXA } from "../oxa";

export function SubscriptRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <sub className={className}>
      <OXA ast={node.children} />
    </sub>
  );
}
