import { Fragment } from "react";
import type { OxaNode } from "../types";
import { OXA } from "../oxa";

export function CiteGroupRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  const children = Array.isArray(node.children)
    ? (node.children as OxaNode[])
    : [];
  const parenthetical = node.kind === "parenthetical";

  return (
    <span id={node.id} className={className} data-cite-kind={String(node.kind)}>
      {parenthetical ? "(" : null}
      {children.map((child, index) => (
        <Fragment key={child.id ?? index}>
          {index > 0 ? "; " : null}
          <OXA ast={child} />
        </Fragment>
      ))}
      {parenthetical ? ")" : null}
    </span>
  );
}
