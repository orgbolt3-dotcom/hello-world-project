import { create } from "zustand";
import type { LocalDataScope } from "@eco/core-contracts";
import { closeLocalDatabase, configureLocalDatabase } from "@eco/core-db";

const DEVICE_ID_KEY = "vitala.device-id.v1";

interface LocalScopeState {
  revision: number;
  scope: LocalDataScope | null;
}

const useLocalScopeStore = create<LocalScopeState>(() => ({
  revision: 0,
  scope: null,
}));

function safeSegment(value: string, fallback: string): string {
  const safe = value
    .toLowerCase()
    .replace(/[^a-z0-9._:-]/g, "-")
    .slice(0, 120);

  return safe || fallback;
}

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  throw new Error("Secure random generation is unavailable on this device.");
}

function deviceId(): string {
  if (typeof window === "undefined") {
    throw new Error("Local scope requires a browser.");
  }

  const stored = window.localStorage.getItem(DEVICE_ID_KEY);

  if (stored && /^[a-z0-9-]{16,80}$/i.test(stored)) {
    return stored;
  }

  const created = createDeviceId();

  window.localStorage.setItem(DEVICE_ID_KEY, created);

  return created;
}

function environmentName(): string {
  return safeSegment(import.meta.env.MODE || "production", "production");
}

/** Builds an isolated scope for one user or this guest device. */
export function resolveLocalDataScope(userId: string | null): LocalDataScope {
  const authenticated = typeof userId === "string" && userId.length > 0;

  const guestDeviceId = authenticated ? null : deviceId();

  const ownerId = authenticated ? userId : `guest:${guestDeviceId}`;

  const kind = authenticated ? "user" : "guest";

  const key = safeSegment(authenticated ? userId : (guestDeviceId ?? ""), "anonymous");

  return {
    ownerId,

    databaseName: `vitala:${environmentName()}:${kind}:${key}`,
  };
}

/** Activates a scope and refreshes local React queries. */
export function activateLocalDataScope(userId: string | null): LocalDataScope {
  const scope = resolveLocalDataScope(userId);

  const current = useLocalScopeStore.getState().scope;

  if (current?.ownerId === scope.ownerId && current.databaseName === scope.databaseName) {
    return current;
  }

  configureLocalDatabase(scope);

  useLocalScopeStore.setState((state) => ({
    scope,
    revision: state.revision + 1,
  }));

  return scope;
}

export function deactivateLocalDataScope(): void {
  closeLocalDatabase();

  useLocalScopeStore.setState((state) => ({
    scope: null,
    revision: state.revision + 1,
  }));
}

export function useLocalScopeRevision(): number {
  return useLocalScopeStore((state) => state.revision);
}
