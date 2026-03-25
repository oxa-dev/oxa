import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  build: {
    lib: {
      entry: "src/anywidget.tsx",
      formats: ["es"],
      fileName: "anywidget",
    },
    // Bundle everything for anywidget (self-contained)
    rollupOptions: {
      external: [],
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});
