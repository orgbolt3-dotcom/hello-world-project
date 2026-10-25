import process from "node:process";

export type RuntimeEnvironment = "development" | "test" | "production";

export interface PublicServerEnvironment {
  nodeEnv: RuntimeEnvironment;
  supabaseUrl: string;
  supabasePublishableKey: string;
}

export interface AiEnvironment {
  accountId: string;
  apiToken: string;
  gatewayId: string;
  primaryModel: string;
  fallbackModel?: string;
  timeoutMs: number;
  maxOutputTokens: number;
  promptVersion: number;
}

export interface MaintenanceEnvironment {
  syncReceiptDays: number;
  aiRequestDays: number;
}

function text(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function required(name: string): string {
  const value = text(process.env[name]);
  if (!value) throw new Error(`Missing required server configuration: ${name}.`);
  return value;
}

function validUrl(value: string, name: string, nodeEnv: RuntimeEnvironment): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
  if (
    parsed.protocol !== "https:" &&
    !(nodeEnv !== "production" && parsed.hostname === "localhost")
  ) {
    throw new Error(`${name} must use HTTPS.`);
  }
  return parsed.toString().replace(/\/$/, "");
}

function safeIdentifier(value: string, name: string): string {
  if (!/^[a-z0-9][a-z0-9._/-]{0,127}$/i.test(value)) {
    throw new Error(`${name} contains unsupported characters.`);
  }
  return value;
}

function boundedInteger(name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = text(process.env[name]);
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
  return value;
}

export function getRuntimeEnvironment(): RuntimeEnvironment {
  const value = text(process.env.NODE_ENV) ?? "development";
  if (value !== "development" && value !== "test" && value !== "production") {
    throw new Error("NODE_ENV must be development, test or production.");
  }
  return value;
}

export function getPublicServerEnvironment(): PublicServerEnvironment {
  const nodeEnv = getRuntimeEnvironment();
  const supabasePublishableKey = required("SUPABASE_PUBLISHABLE_KEY");
  if (supabasePublishableKey.startsWith("sb_secret_")) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY contains a server secret.");
  }
  return {
    nodeEnv,
    supabaseUrl: validUrl(required("SUPABASE_URL"), "SUPABASE_URL", nodeEnv),
    supabasePublishableKey,
  };
}

export function getSupabaseServiceRoleKey(): string {
  const canonical = text(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const legacy = text(process.env.SUPABASE_SECRET_KEY);
  const value = canonical ?? legacy;
  if (!value) {
    throw new Error("Missing required server configuration: SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (value.length < 32) throw new Error("SUPABASE_SERVICE_ROLE_KEY is too short.");
  return value;
}

export function getAiEnvironment(): AiEnvironment | null {
  const accountId = text(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = text(process.env.CLOUDFLARE_AI_API_TOKEN);
  if (!accountId && !apiToken) return null;
  if (!accountId || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN must be configured together.",
    );
  }
  if (apiToken.length < 20) throw new Error("CLOUDFLARE_AI_API_TOKEN is too short.");
  return {
    accountId: safeIdentifier(accountId, "CLOUDFLARE_ACCOUNT_ID"),
    apiToken,
    gatewayId: safeIdentifier(
      text(process.env.CLOUDFLARE_AI_GATEWAY_ID) ?? "vitala",
      "CLOUDFLARE_AI_GATEWAY_ID",
    ),
    primaryModel: safeIdentifier(
      text(process.env.AI_PRIMARY_MODEL) ?? "openai/gpt-4.1-mini",
      "AI_PRIMARY_MODEL",
    ),
    fallbackModel: text(process.env.AI_FALLBACK_MODEL)
      ? safeIdentifier(text(process.env.AI_FALLBACK_MODEL)!, "AI_FALLBACK_MODEL")
      : undefined,
    timeoutMs: 12_000,
    maxOutputTokens: 300,
    promptVersion: 1,
  };
}

export function getCronSecrets(): { current?: string; previous?: string } {
  const current = text(process.env.LOVABLE_CRON_SECRET);
  const previous = text(process.env.LOVABLE_CRON_SECRET_PREVIOUS);
  if (current && current.length < 32) throw new Error("LOVABLE_CRON_SECRET is too short.");
  if (previous && previous.length < 32) {
    throw new Error("LOVABLE_CRON_SECRET_PREVIOUS is too short.");
  }
  return { current, previous };
}

export function getMaintenanceEnvironment(): MaintenanceEnvironment {
  return {
    syncReceiptDays: boundedInteger("SYNC_RECEIPT_RETENTION_DAYS", 30, 7, 365),
    aiRequestDays: boundedInteger("AI_REQUEST_RETENTION_DAYS", 30, 7, 365),
  };
}
