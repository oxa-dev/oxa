import type {
  OxaNode,
  NodeRenderer,
  NodeRenderers,
  NodeRenderersValidated,
} from "./types";

export function validateRenderers(
  renderers?: NodeRenderers,
): NodeRenderersValidated {
  if (!renderers) return {};
  const validated: NodeRenderersValidated = {};
  for (const key in renderers) {
    const renderer = renderers[key];
    if (typeof renderer === "function") {
      validated[key] = { base: renderer };
    } else if (typeof renderer === "object" && "base" in renderer) {
      validated[key] = renderer as NodeRenderersValidated[string];
    } else {
      throw new Error(
        `Renderer for "${key}" must be either a function or an object containing a "base" renderer.`,
      );
    }
  }
  return validated;
}

/**
 * Combines a list of renderers. Put more specific renderers **later** in the list.
 *
 * When a renderer is selected, it will look for a match in **reversed** order.
 *
 * ```typescript
 * mergeRenderers([defaultRenderers, specificRenderers])
 * ```
 */
export function mergeRenderers(
  renderers: NodeRenderers | NodeRenderers[] | undefined,
  validate: true,
): NodeRenderersValidated;
export function mergeRenderers(
  renderers: NodeRenderers | NodeRenderers[] | undefined,
  validate?: false,
): NodeRenderers;
export function mergeRenderers(
  renderers: NodeRenderers | NodeRenderers[] | undefined,
  validate?: boolean,
): NodeRenderers {
  if (!renderers || renderers.length === 0) return {};
  const renderersArray = Array.isArray(renderers) ? renderers : [renderers];
  const merged: NodeRenderersValidated = {};
  for (const renderersObj of renderersArray) {
    for (const key in renderersObj) {
      const next =
        typeof renderersObj[key] === "function"
          ? { base: renderersObj[key] }
          : renderersObj[key];
      merged[key] = {
        ...(merged[key] as Record<string, NodeRenderer>),
        ...next,
      } as NodeRenderersValidated[string];
    }
  }
  if (validate) return validateRenderers(merged);
  return merged as NodeRenderers;
}

export function selectRenderer(
  renderers: NodeRenderersValidated,
  node: OxaNode,
): NodeRenderer | undefined {
  const componentRenderers =
    renderers[node.type] ?? renderers["DefaultComponent"];
  return componentRenderers?.base ?? undefined;
}
