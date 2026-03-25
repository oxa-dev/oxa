export type Tab = "demo" | "atproto";

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "demo", label: "DEMO" },
  { id: "atproto", label: "ATProto" },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-sm">
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          className={`px-3 py-1 font-medium transition-colors ${
            i > 0 ? "border-l border-slate-300" : ""
          } ${
            active === tab.id
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
