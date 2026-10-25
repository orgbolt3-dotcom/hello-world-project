import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  if (typeof window !== "undefined") {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
});
