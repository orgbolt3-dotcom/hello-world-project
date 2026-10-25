import { createFileRoute } from "@tanstack/react-router";

export function healthResponse(): Response {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "vitala",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () => healthResponse(),
    },
  },
});
