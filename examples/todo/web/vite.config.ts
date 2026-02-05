import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import { defineConfig } from "vite";

const entrypoints: string[] = [];
for await (const html of fs.glob("**/*.html", {
  cwd: import.meta.dirname,
  exclude: ["node_modules/**", "dist/**"],
})) {
  entrypoints.push(html);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: entrypoints,
    },
  },
});
