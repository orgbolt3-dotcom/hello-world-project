const PREVIEW_HOST_SUFFIXES = [".lovable.app", ".lovableproject.com", ".chatgpt.com"];

function isPreviewHost(hostname: string): boolean {
  return PREVIEW_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix),
  );
}

function contentSecurityPolicy(request: Request): string {
  const { hostname, protocol } = new URL(request.url);
  const preview = isPreviewHost(hostname);
  const frameAncestors = preview
    ? "'self' https://*.lovable.app https://*.lovable.dev https://*.chatgpt.com"
    : "'none'";
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self' blob: https://*.supabase.co",
  ];
  if (protocol === "https:" && !preview) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/** Adds browser protections without mutating the framework-owned response. */
export function withSecurityHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  const { hostname, protocol } = new URL(request.url);
  const preview = isPreviewHost(hostname);

  headers.set("Content-Security-Policy", contentSecurityPolicy(request));
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(self), payment=(self), usb=()",
  );
  if (!preview) headers.set("X-Frame-Options", "DENY");
  if (protocol === "https:" && !preview) {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  if (response.status >= 400) headers.set("Cache-Control", "no-store");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
