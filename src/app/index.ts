/**
 * app/ — Application bootstrap, providers, shell, router, guards, lifecycle.
 *
 * Phase 1 façade: re-exports the existing modules under their target
 * architectural namespace without physically moving files. Future phases
 * will migrate file owners here.
 */
export * from "./app-shell";
export * from "./providers";
export * from "./router";
export * from "./bootstrap";
export * from "./guards";
