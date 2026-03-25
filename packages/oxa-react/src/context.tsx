import { createContext, useContext, useMemo } from "react";
import type { NodeRenderers, NodeRenderersValidated } from "./types";
import { mergeRenderers } from "./renderers";

const OxaContext = createContext<{
  renderers: NodeRenderersValidated;
}>({
  renderers: {} as NodeRenderersValidated,
});

export function useNodeRenderers(): NodeRenderersValidated {
  return useContext(OxaContext).renderers;
}

export function OxaProvider({
  children,
  renderers,
}: {
  children: React.ReactNode;
  renderers?: NodeRenderers | NodeRenderers[];
}) {
  const validatedRenderers = useMemo(
    () => mergeRenderers(renderers, true),
    [renderers],
  );

  return (
    <OxaContext.Provider value={{ renderers: validatedRenderers }}>
      {children}
    </OxaContext.Provider>
  );
}
