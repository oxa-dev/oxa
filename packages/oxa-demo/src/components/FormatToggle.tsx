export type Format = "json" | "yaml";

interface FormatToggleProps {
  format: Format;
  onChange: (format: Format) => void;
}

export function FormatToggle({ format, onChange }: FormatToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-sm">
      <button
        className={`px-3 py-1 font-medium transition-colors ${
          format === "json"
            ? "bg-indigo-600 text-white"
            : "bg-white text-slate-600 hover:bg-slate-50"
        }`}
        onClick={() => onChange("json")}
      >
        JSON
      </button>
      <button
        className={`px-3 py-1 font-medium transition-colors border-l border-slate-300 ${
          format === "yaml"
            ? "bg-indigo-600 text-white"
            : "bg-white text-slate-600 hover:bg-slate-50"
        }`}
        onClick={() => onChange("yaml")}
      >
        YAML
      </button>
    </div>
  );
}
