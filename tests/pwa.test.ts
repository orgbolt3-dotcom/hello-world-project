import { describe, expect, it } from "vitest";
import { registerServiceWorker } from "@/platform/pwa";

describe("PWA registration", () => {
  it("exports a browser-safe service worker registration entrypoint", () => {
    expect(registerServiceWorker).toBeTypeOf("function");
  });
});
