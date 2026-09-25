import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The app's version, from package.json — only this one number is handed to
// the app (shown under Log out in Settings), not the whole file.
const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

export default defineConfig({
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(version),
  },

  plugins: [
    react(),
    tailwindcss(),
    // Turns the site into an installable app that opens with no internet. It
    // used to generate the small background script (the "service worker")
    // automatically; now it bundles our own (src/sw.ts), because push
    // notifications need code in there and generateSW has no way to add any.
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        // The app's own files only. Her notes are never stored here: they live
        // in the phone's database (see notes-store.ts), and nothing from
        // Supabase is cached, so nobody's writing ends up in the wrong place.
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,jpg}"],
        // The daily focus card illustrations (public/daily-cards/) are full-size
        // artwork, one per house, well over the default 2 MiB-per-file precache
        // limit once there's a full set of them. Precaching all of them would
        // also mean every install downloads every house's art up front, which
        // isn't needed: a card's illustration only matters once that house's
        // card is actually shown, at which point the browser fetches and caches
        // it normally. Nothing here is needed for reading past entries offline.
        // Same reasoning for public/birth-chart/'s decorative art.
        globIgnores: ["daily-cards/**", "birth-chart/**"],
      },
      // A new version waits until she taps Refresh, so the app never reloads
      // itself in the middle of a sentence. (With our own service worker, this
      // only affects the client-side registerSW helper; src/sw.ts is what
      // actually waits, by listening for the SKIP_WAITING message below.)
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
        // Also what Android tints the small notification icon with (see
        // src/sw.ts) — needs to be dark to read against a pale badge.
        theme_color: "#3a3531",
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
