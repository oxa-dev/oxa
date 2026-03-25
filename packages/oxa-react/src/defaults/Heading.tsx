import type { OxaNode } from "../types";
import { OXA } from "../oxa";

const headingClasses: Record<number, string> = {
  1: "text-3xl font-bold mt-6 mb-3",
  2: "text-2xl font-bold mt-5 mb-2",
  3: "text-xl font-semibold mt-4 mb-2",
  4: "text-lg font-semibold mt-3 mb-1",
  5: "text-base font-semibold mt-2 mb-1",
  6: "text-sm font-semibold mt-2 mb-1",
};

export function HeadingRenderer({
  node,
  className,
}: {
  node: OxaNode & { level?: number };
  className?: string;
}) {
  const level = Math.min(Math.max(node.level ?? 1, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
  const classes = [headingClasses[level], className].filter(Boolean).join(" ");
  const content = <OXA ast={node.children} />;

  switch (level) {
    case 1: return <h1 id={node.id} className={classes}>{content}</h1>;
    case 2: return <h2 id={node.id} className={classes}>{content}</h2>;
    case 3: return <h3 id={node.id} className={classes}>{content}</h3>;
    case 4: return <h4 id={node.id} className={classes}>{content}</h4>;
    case 5: return <h5 id={node.id} className={classes}>{content}</h5>;
    case 6: return <h6 id={node.id} className={classes}>{content}</h6>;
  }
}
