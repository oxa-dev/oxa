import { useState, useMemo, useCallback } from "react";
import yaml from "js-yaml";
import { Editor } from "./components/Editor";
import { FormatToggle, type Format } from "./components/FormatToggle";
import { ExamplePicker } from "./components/ExamplePicker";
import { TabBar, type Tab } from "./components/TabBar";
import { DemoView } from "./components/DemoView";
import { AtprotoView } from "./components/AtprotoView";
import { ValidationBadge } from "./components/ValidationBadge";
import { validate } from "./validate";
import { examples } from "./examples";

interface AppProps {
  initialExample?: string;
  fullscreen?: boolean;
}

function serializeDocument(
  doc: Record<string, unknown>,
  format: Format,
): string {
  if (format === "json") {
    return JSON.stringify(doc, null, 2);
  }
  return yaml.dump(doc, { indent: 2, lineWidth: 80, noRefs: true });
}

function convertFormat(
  source: string,
  from: Format,
  to: Format,
): string | null {
  try {
    const parsed =
      from === "json"
        ? JSON.parse(source)
        : (yaml.load(source) as Record<string, unknown>);
    return serializeDocument(parsed, to);
  } catch {
    return null;
  }
}

export function App({
  initialExample = "rfc0003",
  fullscreen = false,
}: AppProps) {
  const initialDoc =
    examples.find((e) => e.id === initialExample) ?? examples[0];

  const [source, setSource] = useState(() =>
    serializeDocument(initialDoc.document, "json"),
  );
  const [format, setFormat] = useState<Format>("json");
  const [activeTab, setActiveTab] = useState<Tab>("demo");
  const [selectedExample, setSelectedExample] = useState(initialDoc.id);

  const validation = useMemo(() => validate(source, format), [source, format]);

  const handleFormatChange = useCallback(
    (newFormat: Format) => {
      if (newFormat === format) return;
      const converted = convertFormat(source, format, newFormat);
      if (converted !== null) {
        setSource(converted);
        setFormat(newFormat);
      }
    },
    [source, format],
  );

  const handleExampleChange = useCallback(
    (id: string) => {
      const example = examples.find((e) => e.id === id);
      if (!example) return;
      setSelectedExample(id);
      setSource(serializeDocument(example.document, format));
    },
    [format],
  );

  const outerClass = fullscreen
    ? "flex flex-col w-full h-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
    : "flex flex-col h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm";

  return (
    <div className={outerClass}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-200">
        <ExamplePicker
          selected={selectedExample}
          onChange={handleExampleChange}
        />
        <FormatToggle format={format} onChange={handleFormatChange} />
        <ValidationBadge valid={validation.valid} errors={validation.errors} />
        <div className="ml-auto">
          <TabBar active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Validation errors */}
      {!validation.valid &&
        validation.errors &&
        validation.errors.length > 0 && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700 font-mono overflow-auto max-h-32">
            {validation.errors.map((error, i) => (
              <div key={i} className="py-0.5">
                {error}
              </div>
            ))}
          </div>
        )}

      {/* Split panels */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Editor */}
        <div className="relative flex-1 min-w-0 border-r border-slate-200">
          <Editor value={source} onChange={setSource} format={format} />
        </div>

        {/* Right: Output */}
        <div className="relative flex-1 min-w-0">
          {activeTab === "demo" ? (
            <DemoView source={source} format={format} />
          ) : (
            <AtprotoView source={source} format={format} />
          )}
        </div>
      </div>
    </div>
  );
}
