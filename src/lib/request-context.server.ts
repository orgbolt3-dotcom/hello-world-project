/**
 * Per-request correlation context used by the SSR wrapper in src/server.ts.
 * Server-only: never imported from client code.
 */
export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  startedAt: number;
}

function newRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export function getRequestContext(request: Request): RequestContext {
  const incoming = request.headers.get("x-request-id");
  let path = "/";
  try {
    path = new URL(request.url).pathname;
  } catch {
    /* keep default */
  }
  return {
    requestId: incoming && incoming.length <= 128 ? incoming : newRequestId(),
    method: request.method,
    path,
    startedAt: Date.now(),
  };
}

export function requestDurationMs(context: RequestContext): number {
  return Math.max(0, Date.now() - context.startedAt);
}

/** Echoes the correlation id back so logs and responses can be matched. */
export function withRequestContext(response: Response, context: RequestContext): Response {
  const headers = new Headers(response.headers);
  headers.set("x-request-id", context.requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
