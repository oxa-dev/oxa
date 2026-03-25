import { useMemo } from "react";
import yaml from "js-yaml";
import { oxaToAtproto, type Document, type Session } from "@oxa/core";
import { Editor } from "./Editor";

const session: Session = { log: console };

interface AtprotoViewProps {
  source: string;
  format: "json" | "yaml";
}

export function AtprotoView({ source, format }: AtprotoViewProps) {
  const result = useMemo(() => {
    try {
      const parsed =
        format === "json"
          ? JSON.parse(source)
          : (yaml.load(source) as Record<string, unknown>);

      if (!parsed || parsed.type !== "Document") {
        return {
          error: "Source must be a Document node (type: 'Document').",
        };
      }

      const atproto = oxaToAtproto(session, parsed as Document);
      return { data: JSON.stringify(atproto, null, 2) };
    } catch (e) {
      return { error: String(e) };
    }
  }, [source, format]);

  if (result.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-mono whitespace-pre-wrap">
        {result.error}
      </div>
    );
  }

  return (
    <Editor
      value={result.data!}
      onChange={() => {}}
      format="json"
      readOnly
    />
  );
}
