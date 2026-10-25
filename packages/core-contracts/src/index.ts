/**
 * @eco/core-contracts — single source of truth for the shapes exchanged
 * between the UI, the local database (Dexie) and the backend (Cloud).
 *
 * This package has ZERO runtime dependencies and imports nothing else in the
 * monorepo. Every other package depends on it, never the reverse.
 */

export * from "./ids";
export * from "./records";
export * from "./sync";
export * from "./sync-validation";
export * from "./modules";
export * from "./roles";
export * from "./write-policy";
export * from "./assistant";
export * from "./flash";
export * from "./scan";
export * from "./radar";
