import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { logServerError } from "./lib/safe-log.server";
import { getRequestContext, requestDurationMs } from "./lib/request-context.server";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  const context = getRequestContext(getRequest());
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    logServerError("request.middleware_failed", error, {
      ...context,
      durationMs: requestDurationMs(context),
    });
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
