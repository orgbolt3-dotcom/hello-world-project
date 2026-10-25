import {
  getAiEnvironment,
  getPublicServerEnvironment,
  getSupabaseServiceRoleKey,
} from "@/config/env.server";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined — always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a createServerFn handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

export function getServerConfig() {
  const base = getPublicServerEnvironment();
  const ai = getAiEnvironment();
  return {
    nodeEnv: base.nodeEnv,
    supabaseUrl: base.supabaseUrl,
    supabasePublishableKey: base.supabasePublishableKey,
    get supabaseSecretKey() {
      return getSupabaseServiceRoleKey();
    },
    ai: ai
      ? {
          cloudflareAccountId: ai.accountId,
          cloudflareApiToken: ai.apiToken,
          gatewayId: ai.gatewayId,
          primaryModel: ai.primaryModel,
          fallbackModel: ai.fallbackModel,
          timeoutMs: ai.timeoutMs,
          maxOutputTokens: ai.maxOutputTokens,
          promptVersion: ai.promptVersion,
        }
      : null,
  };
}
