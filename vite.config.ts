import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    // "@/..." means "src/..." — the same shortcut the whole codebase already uses.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },

  // The Supabase keys are read as NEXT_PUBLIC_* by the deployed site, so they
  // are still accepted here. Nothing has to be renamed in Netlify.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],

  server: {
    // Same port as before, so the Google sign-in address already allowed by
    // Supabase keeps working while developing. strictPort stops it quietly
    // moving to another port, which would make Google sign-in fail.
    port: 3000,
    strictPort: true,
  },
});
