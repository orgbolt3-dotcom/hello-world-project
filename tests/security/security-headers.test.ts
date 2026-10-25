import { describe, expect, it } from "vitest";
import { withSecurityHeaders } from "@/lib/security-headers.server";

function response(status = 200): Response {
  return new Response("ok", {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60",
    },
  });
}

describe("en-têtes HTTP de sécurité", () => {
  it("applique les protections principales sur une réponse HTTPS de production", () => {
    const result = withSecurityHeaders(response(), new Request("https://vitala.example.com/"));

    expect(result.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(result.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(result.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(result.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(result.headers.get("X-DNS-Prefetch-Control")).toBe("off");
    expect(result.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
    expect(result.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
    expect(result.headers.get("X-Frame-Options")).toBe("DENY");
    expect(result.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains",
    );
  });

  it("n'autorise pas le framing d'une origine de production", () => {
    const result = withSecurityHeaders(
      response(),
      new Request("https://vitala.example.com/embedded"),
    );

    expect(result.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(result.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("réserve HSTS et X-Frame-Options aux origines HTTPS non preview", () => {
    const result = withSecurityHeaders(response(), new Request("http://localhost:3000/"));

    expect(result.headers.get("Strict-Transport-Security")).toBeNull();
    expect(result.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("conserve no-store sur les réponses d'erreur", () => {
    const result = withSecurityHeaders(
      response(500),
      new Request("https://vitala.example.com/error"),
    );

    expect(result.headers.get("Cache-Control")).toBe("no-store");
  });

  it("autorise explicitement les frames nécessaires en preview sans activer HSTS", () => {
    const result = withSecurityHeaders(response(), new Request("https://preview.lovable.app/"));
    const csp = result.headers.get("Content-Security-Policy") ?? "";

    expect(csp).toContain("frame-ancestors 'self' https://*.lovable.app");
    expect(csp).toContain("https://*.chatgpt.com");
    expect(result.headers.get("X-Frame-Options")).toBeNull();
    expect(result.headers.get("Strict-Transport-Security")).toBeNull();
  });
});
