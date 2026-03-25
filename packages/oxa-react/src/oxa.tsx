import type { OxaNode } from "./types";
import { useNodeRenderers } from "./context";
import { selectRenderer } from "./renderers";

function DefaultComponent({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  if (!node.children) return <span className={className}>{node.value}</span>;
  return <OXA ast={node.children} className={className} />;
}

export function OXA({
  ast,
  className,
}: {
  ast?: OxaNode | OxaNode[];
  className?: string;
}) {
  const renderers = useNodeRenderers();
  if (!ast) return null;

  if (!Array.isArray(ast)) {
    const Component = selectRenderer(renderers, ast) ?? DefaultComponent;
    return <Component node={ast} className={className} />;
  }

  if (ast.length === 0) return null;

  return (
    <>
      {ast.map((node, i) => {
        const Component = selectRenderer(renderers, node) ?? DefaultComponent;
        return (
          <Component key={node.id ?? i} node={node} className={className} />
        );
      })}
    </>
  );
}
