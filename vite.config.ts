// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

const pkg = (name: string) =>
  fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [VitePWA({
      strategies: "generateSW",
      outDir: "dist/client",
      filename: "sw.js",
      manifest: false,
      injectRegister: null,
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      includeAssets: ["offline.html", "icon-192.png", "icon-512.png", "icon-maskable-512.png"],
      workbox: {
        cacheId: "ecosystem",
        globPatterns: ["assets/**/*.{js,css,woff,woff2,png,jpg,jpeg,svg,webp,avif}"],
        globIgnores: ["**/sw.js", "**/workbox-*.js"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Only the fallback itself uses the precache navigation route.
        // Real pages go through NetworkFirst below, never a cache-first HTML shell.
        navigateFallback: "offline.html",
        navigateFallbackAllowlist: [/^\/offline\.html$/],
        navigateFallbackDenylist: [/^\/~oauth(?:\/|$)/, /^\/api(?:\/|$)/, /^\/(?:auth|admin|reset-password)(?:\/|$)/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === "navigate" &&
              url.origin === self.location.origin &&
              ["/", "/flash", "/radar", "/espace", "/talents"].includes(url.pathname) &&
              !url.search,
            handler: "NetworkFirst",
            options: {
              cacheName: "ecosystem-public-pages",
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 5, maxAgeSeconds: 7 * 24 * 60 * 60 },
              precacheFallback: { fallbackURL: "offline.html" },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin &&
              /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|png|jpe?g|svg|webp|avif)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "ecosystem-hashed-assets",
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    })],
    resolve: {
      // The worker bundle is built without tsconfig paths, so the monorepo
      // packages need an explicit alias to stay resolvable everywhere.
      alias: {
        "@eco/core-contracts": pkg("core-contracts"),
        "@eco/core-logic": pkg("core-logic"),
        "@eco/core-db": pkg("core-db"),
        "@eco/core-sync": pkg("core-sync"),
      },
    },
  },
});
