import { examples } from "../examples";

interface ExamplePickerProps {
  selected: string;
  onChange: (id: string) => void;
}

export function ExamplePicker({ selected, onChange }: ExamplePickerProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      {examples.map((ex) => (
        <option key={ex.id} value={ex.id}>
          {ex.label}
        </option>
      ))}
    </select>
  );
}
