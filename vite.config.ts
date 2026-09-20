import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Turns the site into an installable app that opens with no internet. It
    // builds a small background script (the "service worker") that keeps a copy
    // of the app's own files on the phone.
    VitePWA({
      // A new version waits until she taps Refresh, so the app never reloads
      // itself in the middle of a sentence.
      registerType: "prompt",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Becomely",
        short_name: "Becomely",
        description: "Turn your intentions into daily action.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#faf7f2",
        theme_color: "#faf7f2",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            // The phone crops this one into a circle or rounded square, so the
            // artwork is drawn smaller to stay inside the safe area.
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // The app's own files only. Her notes are never stored here: they live
        // in the phone's database (see notes-store.ts), and nothing from
        // Supabase is cached, so nobody's writing ends up in the wrong place.
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,jpg}"],
        // Any web address opens the app, including a refresh on a note and the
        // return trip from Google sign-in.
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],

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
