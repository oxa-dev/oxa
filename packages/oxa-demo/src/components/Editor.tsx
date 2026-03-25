import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { foldGutter } from "@codemirror/language";
import type { Extension } from "@codemirror/state";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  format?: "json" | "yaml";
  readOnly?: boolean;
}

export function Editor({
  value,
  onChange,
  format = "json",
  readOnly = false,
}: EditorProps) {
  const extensions = useMemo<Extension[]>(() => {
    const exts: Extension[] = [foldGutter()];
    if (format === "json") {
      exts.push(json());
    } else {
      exts.push(yaml());
    }
    return exts;
  }, [format]);

  return (
    <CodeMirror
      value={value}
      onChange={readOnly ? undefined : onChange}
      extensions={extensions}
      readOnly={readOnly}
      theme="dark"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        bracketMatching: true,
        closeBrackets: !readOnly,
        indentOnInput: !readOnly,
        highlightActiveLine: !readOnly,
        tabSize: 2,
      }}
      height="100%"
      style={{ position: "absolute", inset: 0 }}
    />
  );
}
