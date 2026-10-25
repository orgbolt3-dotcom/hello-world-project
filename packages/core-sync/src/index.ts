/**
 * @eco/core-sync — the synchronisation engine.
 *
 * Pure orchestration: it knows WHEN to pull and push, in which order, and how
 * to recover from failures. It owns no storage and no network client — both
 * are injected, so the engine can run in a worker, in a test, or on a server.
 */

export * from "./engine";
export * from "./transport";
