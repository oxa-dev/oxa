import type { OxaNode } from "../types";

export function CodeCellRenderer({
  node,
  className,
}: {
  node: OxaNode & {
    code?: string;
    language?: string;
    isEchoed?: boolean;
  };
  className?: string;
}) {
  if (node.isEchoed !== true) return null;

  return (
    <pre
      id={node.id}
      className={
        className ??
        "bg-slate-100 rounded-lg p-4 overflow-x-auto mb-3 text-sm"
      }
    >
      <code className={node.language ? `language-${node.language}` : undefined}>
        {node.code}
      </code>
    </pre>
  );
}
