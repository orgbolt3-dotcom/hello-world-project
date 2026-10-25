import { renderErrorPage } from "./lib/error-page";
import { logServerError } from "./lib/safe-log.server";
import { withSecurityHeaders } from "./lib/security-headers.server";
import {
  getRequestContext,
  requestDurationMs,
  withRequestContext,
  type RequestContext,
} from "./lib/request-context.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
  context: RequestContext,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  logServerError("ssr.unhandled_response", new Error("Framework returned an unhandled SSR error"), {
    ...context,
    durationMs: requestDurationMs(context),
  });
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const requestContext = getRequestContext(request);
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response, requestContext);
      return withRequestContext(withSecurityHeaders(normalized, request), requestContext);
    } catch (error) {
      logServerError("ssr.fetch_failed", error, {
        ...requestContext,
        durationMs: requestDurationMs(requestContext),
      });
      const response = withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        request,
      );
      return withRequestContext(response, requestContext);
    }
  },
};
