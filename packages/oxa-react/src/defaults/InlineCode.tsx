import type { OxaNode } from "../types";

export function InlineCodeRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <code
      className={
        className ??
        "bg-slate-100 rounded px-1.5 py-0.5 text-sm font-mono text-pink-600"
      }
    >
      {node.value}
    </code>
  );
}
