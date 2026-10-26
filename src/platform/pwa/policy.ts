/** Published custom domains remain eligible; editor previews never cache the shell. */
export function shouldDisableServiceWorker({
  production,
  hostname,
  embedded,
  search,
}: {
  production: boolean;
  hostname: string;
  embedded: boolean;
  search: string;
}): boolean {
  const host = hostname.toLowerCase();
  const lovableHost = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host);
  const label = host.split(".")[0] ?? "";
  return (
    !production ||
    embedded ||
    new URLSearchParams(search).get("sw") === "off" ||
    (lovableHost && /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label)) ||
    (lovableHost && /^project--.+-dev$/.test(label)) ||
    ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    )
  );
}

export function isAppShellWorker(scriptURL: string, origin: string): boolean {
  const url = new URL(scriptURL, origin);
  return url.origin === origin && ["/sw.js", "/service-worker.js"].includes(url.pathname);
}