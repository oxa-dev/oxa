import type { OxaNode } from "../types";
import { OXA } from "../oxa";

export function DocumentRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  return (
    <article className={className}>
      {Array.isArray(node.title) && (
        <header>
          <h1 className="text-3xl font-bold mb-4">
            <OXA ast={node.title as OxaNode[]} />
          </h1>
        </header>
      )}
      <OXA ast={node.children} />
    </article>
  );
}
