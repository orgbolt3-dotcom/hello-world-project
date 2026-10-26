export interface ClientEnvironment {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

/** Imported applications can render their local shell before Cloud is connected. */
export function hasClientConnection(): boolean {
  return typeof import.meta.env.VITE_SUPABASE_URL === "string" &&
    import.meta.env.VITE_SUPABASE_URL.trim().length > 0 &&
    typeof import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === "string" &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.trim().length > 0;
}

function required(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing public configuration: ${name}.`);
  }
  return value.trim();
}

export function getClientEnvironment(): ClientEnvironment {
  const supabaseUrl = required(import.meta.env.VITE_SUPABASE_URL, "VITE_SUPABASE_URL");
  const supabasePublishableKey = required(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  );
  let parsed: URL;
  try {
    parsed = new URL(supabaseUrl);
  } catch {
    throw new Error("VITE_SUPABASE_URL must be a valid URL.");
  }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new Error("VITE_SUPABASE_URL must use HTTPS outside localhost.");
  }
  if (
    supabasePublishableKey.startsWith("sb_secret_") ||
    /service[_-]?role/i.test(supabasePublishableKey)
  ) {
    throw new Error("A server secret was placed in VITE_SUPABASE_PUBLISHABLE_KEY.");
  }
  return { supabaseUrl: parsed.toString().replace(/\/$/, ""), supabasePublishableKey };
}
