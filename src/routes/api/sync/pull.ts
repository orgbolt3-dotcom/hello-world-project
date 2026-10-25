import { createFileRoute } from "@tanstack/react-router";

/** Sync endpoint called by the background worker: fetch what changed. */
export const Route = createFileRoute("/api/sync/pull")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { readSyncSession } = await import("@/lib/sync/session.server");
        const { runPull } = await import("@/lib/sync/transport.server");
        const { MAX_SYNC_BODY_BYTES, SyncValidationError, validatePull } =
          await import("@/lib/sync/validate");

        const session = await readSyncSession(request);
        if (!session) return json({ error: "unauthorized" }, 401);

        if (!isJson(request)) return json({ error: "json_required" }, 415);
        try {
          const body = await readLimitedJson(request, MAX_SYNC_BODY_BYTES);
          const result = await runPull(session.supabase as never, validatePull(body));
          return json(result, 200);
        } catch (error) {
          if (error instanceof PayloadTooLargeError) {
            return json({ error: "payload_too_large" }, 413);
          }
          if (error instanceof SyncValidationError || error instanceof SyntaxError) {
            return json({ error: "invalid_sync_payload" }, 400);
          }
          return json({ error: "sync_unavailable" }, 503);
        }
      },
    },
  },
});

class PayloadTooLargeError extends Error {}

function isJson(request: Request): boolean {
  return request.headers.get("content-type")?.split(";", 1)[0]?.trim() === "application/json";
}

async function readLimitedJson(request: Request, maximum: number): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maximum) throw new PayloadTooLargeError();
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maximum) throw new PayloadTooLargeError();
  return JSON.parse(text);
}

function json(value: unknown, status: number): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
