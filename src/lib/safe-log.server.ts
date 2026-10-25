const MAX_MESSAGE_LENGTH = 1_000;

const REDACTIONS: Array<[RegExp, string]> = [
  [/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]"],
  [/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]+\b/gi, "sb_[REDACTED]"],
  [/\b(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{16,}\b/gi, "[REDACTED_TOKEN]"],
  [/(?:password|secret|token|authorization|apikey)\s*[=:]\s*[^\s,;]+/gi, "$1=[REDACTED]"],
];

function redact(value: string): string {
  return REDACTIONS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  ).slice(0, MAX_MESSAGE_LENGTH);
}

function describe(error: unknown): { name: string; message: string } {
  if (error instanceof Error) {
    return { name: redact(error.name || "Error"), message: redact(error.message) };
  }
  if (typeof error === "string") return { name: "Error", message: redact(error) };
  return { name: "Error", message: "Unexpected server failure" };
}

export interface SafeLogContext {
  requestId?: string;
  method?: string;
  path?: string;
  durationMs?: number;
}

/** Emits a bounded, structured event; request bodies and stack traces are never logged. */
export function logServerError(event: string, error: unknown, context: SafeLogContext = {}): void {
  const detail = describe(error);
  console.error(
    JSON.stringify({
      level: "error",
      event: redact(event),
      error: detail,
      ...(context.requestId ? { requestId: redact(context.requestId) } : {}),
      ...(context.method ? { method: redact(context.method) } : {}),
      ...(context.path ? { path: redact(context.path.split("?", 1)[0] ?? "/") } : {}),
      ...(Number.isFinite(context.durationMs)
        ? { durationMs: Math.max(0, Math.min(300_000, context.durationMs!)) }
        : {}),
      at: new Date().toISOString(),
    }),
  );
}
