import { describe, expect, it } from "vitest";
import { withSecurityHeaders } from "@/lib/security-headers.server";

describe("en-têtes de sécurité HTTP", () => {
  it("interdit le framing et active HSTS en production HTTPS", () => {
    const secured = withSecurityHeaders(
      new Response("ok", { headers: { "content-type": "text/plain" } }),
      new Request("https://app.vitala.cm/flash"),
    );

    expect(secured.headers.get("x-frame-options")).toBe("DENY");
    expect(secured.headers.get("strict-transport-security")).toContain("max-age=31536000");
    expect(secured.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(secured.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("empêche la mise en cache des réponses en erreur", () => {
    const secured = withSecurityHeaders(
      new Response("failure", { status: 500 }),
      new Request("https://app.vitala.cm/"),
    );

    expect(secured.headers.get("cache-control")).toBe("no-store");
  });
});
