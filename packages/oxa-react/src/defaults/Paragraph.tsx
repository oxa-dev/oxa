import type { OxaNode } from "../types";
import { OXA } from "../oxa";

export function ParagraphRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <p id={node.id} className={className ?? "mb-3"}>
      <OXA ast={node.children} />
    </p>
  );
}
