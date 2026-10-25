/**
 * Turns an incoming HTTP request into a Supabase client acting as the caller.
 * Used by the sync endpoints, which are called by the background worker.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getPublicServerEnvironment } from "@/config/env.server";

export interface SyncSession {
  supabase: ReturnType<typeof createClient<Database>>;
  userId: string;
}

function isOpaqueKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

/** Returns the caller's session, or null when the credentials are not valid. */
export async function readSyncSession(request: Request): Promise<SyncSession | null> {
  const { supabaseUrl: url, supabasePublishableKey: key } = getPublicServerEnvironment();

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  return { supabase, userId };
}
