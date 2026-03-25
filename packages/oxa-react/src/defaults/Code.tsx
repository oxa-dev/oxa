import type { OxaNode } from "../types";

export function CodeRenderer({
  node,
  className,
}: {
  node: OxaNode & { language?: string };
  className?: string;
}) {
  return (
    <pre
      id={node.id}
      className={
        className ??
        "bg-slate-100 rounded-lg p-4 overflow-x-auto mb-3 text-sm"
      }
    >
      <code className={node.language ? `language-${node.language}` : undefined}>
        {node.value}
      </code>
    </pre>
  );
}
