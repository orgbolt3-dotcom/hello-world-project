import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "@/platform/pwa";
import { isAppShellWorker, shouldDisableServiceWorker } from "@/platform/pwa/policy";
import { hasClientConnection } from "@/config/env.public";

const published = { production: true, hostname: "entraide.example.com", embedded: false, search: "" };

describe("PWA registration", () => {
  it("keeps the local shell independent of an absent Cloud connection", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    expect(hasClientConnection()).toBe(false);
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(hasClientConnection()).toBe(true);
  });
  it("exports a browser-safe service worker registration entrypoint", () => {
    expect(registerServiceWorker).toBeTypeOf("function");
  });

  it("never registers in development", () => {
    expect(shouldDisableServiceWorker({ ...published, production: false })).toBe(true);
  });

  it.each([
    "id-preview--e21c172d-d79f-4a29-973e-4682f2c84bb1.lovable.app",
    "preview-v2--project.lovable.app",
    "ID-PREVIEW--project.gpt-eng.com",
    "preview--project.gptengineer.run",
    "project--project-id-dev.lovable.app",
    "lovableproject.com",
    "draft.lovableproject-dev.com",
    "beta.lovable.dev",
  ])("refuses preview host %s", (hostname) => {
    expect(shouldDisableServiceWorker({ ...published, hostname })).toBe(true);
  });

  it("never registers inside an iframe", () => {
    expect(shouldDisableServiceWorker({ ...published, embedded: true })).toBe(true);
  });

  it("supports the explicit sw=off kill switch", () => {
    expect(shouldDisableServiceWorker({ ...published, search: "?sw=off" })).toBe(true);
  });

  it.each(["entraide.example.com", "preview-v2--shop.example.com", "entraide.lovable.app"])(
    "allows published origin %s", (hostname) => {
      expect(shouldDisableServiceWorker({ ...published, hostname })).toBe(false);
    },
  );

  it("identifies only same-origin app-shell workers, not messaging workers", () => {
    expect(isAppShellWorker("https://app.example/sw.js", "https://app.example")).toBe(true);
    expect(isAppShellWorker("https://app.example/firebase-messaging-sw.js", "https://app.example")).toBe(false);
    expect(isAppShellWorker("https://other.example/sw.js", "https://app.example")).toBe(false);
  });

  it("unregisters stale preview shell workers without touching messaging", async () => {
    vi.stubEnv("PROD", false);
    const shellUnregister = vi.fn().mockResolvedValue(true);
    const messagingUnregister = vi.fn().mockResolvedValue(true);
    const register = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register,
        getRegistrations: vi.fn().mockResolvedValue([
          { active: { scriptURL: `${window.location.origin}/sw.js` }, unregister: shellUnregister },
          { active: { scriptURL: `${window.location.origin}/firebase-messaging-sw.js` }, unregister: messagingUnregister },
        ]),
      },
    });
    registerServiceWorker();
    await vi.waitFor(() => expect(shellUnregister).toHaveBeenCalledOnce());
    expect(register).not.toHaveBeenCalled();
    expect(messagingUnregister).not.toHaveBeenCalled();
    Reflect.deleteProperty(navigator, "serviceWorker");
  });
});
