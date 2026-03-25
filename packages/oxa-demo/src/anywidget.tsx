import { createRoot } from "react-dom/client";
import { App } from "./App";
import cssText from "./styles.css?inline";

interface AnywidgetModel {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  on(event: string, callback: () => void): void;
}

function render({ model, el }: { model: AnywidgetModel; el: HTMLElement }) {
  // Inject Tailwind styles into the widget container
  const style = document.createElement("style");
  style.textContent = cssText;
  el.appendChild(style);

  const container = document.createElement("div");
  el.appendChild(container);

  const initialExample =
    (model.get("example") as string | undefined) ?? "rfc0003";
  const fullscreen = (model.get("fullscreen") as boolean | undefined) ?? false;

  const root = createRoot(container);
  root.render(<App initialExample={initialExample} fullscreen={fullscreen} />);

  return () => root.unmount();
}

export default { render };
