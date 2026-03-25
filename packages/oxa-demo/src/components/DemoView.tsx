import { useMemo } from "react";
import yaml from "js-yaml";
import { OxaProvider, OXA, defaultRenderers } from "@oxa/react";
import type { OxaNode } from "@oxa/react";

interface DemoViewProps {
  source: string;
  format: "json" | "yaml";
}

export function DemoView({ source, format }: DemoViewProps) {
  const parsed = useMemo(() => {
    try {
      const data =
        format === "json"
          ? JSON.parse(source)
          : (yaml.load(source) as Record<string, unknown>);

      if (!data || typeof data !== "object" || !("type" in data)) {
        return { error: "Source must have a 'type' field." };
      }

      return { node: data as OxaNode };
    } catch (e) {
      return { error: String(e) };
    }
  }, [source, format]);

  if (parsed.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-mono whitespace-pre-wrap">
        {parsed.error}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-auto p-4 prose prose-slate max-w-none">
      <OxaProvider renderers={defaultRenderers}>
        <OXA ast={parsed.node} />
      </OxaProvider>
    </div>
  );
}
