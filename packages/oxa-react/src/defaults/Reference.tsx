import type { OxaNode } from "../types";
import { OXA } from "../oxa";

function getReferenceFallback(node: OxaNode): string {
  const csl = node.csl;

  if (csl && typeof csl === "object" && !Array.isArray(csl)) {
    const record = csl as Record<string, unknown>;

    for (const key of ["title", "citation-key", "id"]) {
      const value = record[key];
      if (typeof value === "string" && value.length > 0) {
        return value;
      }
    }
  }

  return node.id ?? "Reference";
}

export function ReferenceRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  const children = Array.isArray(node.children)
    ? (node.children as OxaNode[])
    : undefined;

  return (
    <div id={node.id} className={className}>
      {children && children.length > 0 ? (
        <OXA ast={children} />
      ) : (
        getReferenceFallback(node)
      )}
    </div>
  );
}
