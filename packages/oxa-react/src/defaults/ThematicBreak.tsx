import type { OxaNode } from "../types";

export function ThematicBreakRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <hr
      id={node.id}
      className={className ?? "border-slate-300 my-6"}
    />
  );
}
