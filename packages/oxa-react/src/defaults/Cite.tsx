import type { OxaNode } from "../types";
import { OXA } from "../oxa";

function inlineNodes(value: unknown): OxaNode[] | undefined {
  return Array.isArray(value) ? (value as OxaNode[]) : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function CiteRenderer({
  node,
  className,
}: {
  node: OxaNode;
  className?: string;
}) {
  const xref = stringValue(node.xref) ?? "";
  const children = inlineNodes(node.children);
  const prefix = inlineNodes(node.prefix);
  const suffix = inlineNodes(node.suffix);
  const locator = stringValue(node.locator);

  return (
    <cite id={node.id} className={className} data-xref={xref}>
      <OXA ast={prefix} />
      {children && children.length > 0 ? <OXA ast={children} /> : `@${xref}`}
      {locator ? `, ${locator}` : null}
      <OXA ast={suffix} />
    </cite>
  );
}
