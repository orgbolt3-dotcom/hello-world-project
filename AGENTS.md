<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## PWA architecture
- The public local shell must render without a Cloud connection; skip session subscriptions and network synchronization until public connection configuration exists.
- Keep a single browser-safe registration wrapper in the PWA platform layer; compatibility barrels must re-export it, so no import path bypasses preview and iframe guards.
- Generate the published offline worker with vite-plugin-pwa generateSW; use NetworkFirst for public navigations and CacheFirst only for same-origin hashed assets, excluding authentication, APIs and OAuth from caching.
- The unpublished project's public/sw.js is a same-path cleanup worker for legacy preview caches; production generateSW replaces that output. Never delete unrelated messaging caches or unregister messaging workers.
- Opportunity suggestions stream from the Lovable AI Gateway via the public server route /api/public/opportunities (input-length capped); the separate Vita assistant keeps its own provider setup. Why: keeps the AI key server-side and works without a Cloud session.

## Scan architecture
- The public Scan page uses the voluntary-search hook, not the legacy realtime hook; queries run only on submission and reset on local identity changes, because immediate search must not become Radar surveillance.
- Offline Scan searches only synchronized, complete live public Flash previews in the current local scope; it never infers coordinates, category or availability, because missing data must not become fabricated matches.
- Nearby Scan reuses the existing validated public server function only with public connection configuration, network access and an explicitly granted temporary location; no location or query history is persisted.
