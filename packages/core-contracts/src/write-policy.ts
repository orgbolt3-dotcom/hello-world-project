import type { MutationKind, SyncedTable } from "./sync";

export interface ClientWritePolicy {
  create: boolean;

  /** Fields accepted through an ordinary repository update. */
  update: readonly string[];

  /** Fields reserved for a domain command/state machine. */
  command: readonly string[];

  delete: boolean;
}

/**
 * Single client-write allowlist shared by IndexedDB and the sync backend.
 * Ownership and envelope fields are injected by trusted infrastructure.
 */
export const CLIENT_WRITE_POLICY = {
  users: {
    create: false,
    update: ["displayName", "handle", "avatarMediaId", "locale"],
    command: [],
    delete: false,
  },

  udi: {
    create: false,
    update: [],
    command: [],
    delete: false,
  },

  flashes: {
    create: true,
    update: ["title", "body", "status", "expiresAt", "mediaIds"],
    command: [],
    delete: true,
  },

  missions: {
    create: true,

    update: ["title", "brief", "rewardAmount", "rewardCurrency", "dueAt"],

    command: ["status", "assigneeId"],

    delete: true,
  },

  radars: {
    create: true,

    update: ["title", "query", "category", "areaLabel", "radiusKm", "startsAt", "expiresAt"],

    command: ["status"],
    delete: true,
  },

  posts: {
    create: true,
    update: ["body", "visibility", "mediaIds"],
    command: [],
    delete: true,
  },

  media: {
    create: true,

    update: ["kind", "state", "remotePath", "mimeType", "byteSize", "width", "height"],

    command: [],
    delete: true,
  },

  notifications: {
    create: false,
    update: ["readAt"],
    command: [],
    delete: false,
  },

  audit: {
    create: false,
    update: [],
    command: [],
    delete: false,
  },
} as const satisfies Record<SyncedTable, ClientWritePolicy>;

export function isClientMutationAllowed(table: SyncedTable, kind: MutationKind): boolean {
  const policy = CLIENT_WRITE_POLICY[table];

  if (kind === "create") {
    return policy.create;
  }

  if (kind === "delete") {
    return policy.delete;
  }

  return policy.update.length > 0 || policy.command.length > 0;
}

/**
 * All fields accepted by the sync transport, including fields produced by a
 * controlled domain command.
 */
export function clientWritableFields(table: SyncedTable): readonly string[] {
  const policy = CLIENT_WRITE_POLICY[table];

  return [...policy.update, ...policy.command];
}

/** Fields accepted by the ordinary generic repository only. */
export function clientDirectWritableFields(table: SyncedTable): readonly string[] {
  return CLIENT_WRITE_POLICY[table].update;
}

export function protectedClientFields(
  table: SyncedTable,
  patch: Record<string, unknown>,
): string[] {
  const allowed = new Set<string>(clientDirectWritableFields(table));

  return Object.keys(patch).filter((field) => !allowed.has(field));
}

export function filterClientWritablePatch(
  table: SyncedTable,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const allowed = new Set<string>(clientWritableFields(table));

  return Object.fromEntries(Object.entries(patch).filter(([field]) => allowed.has(field)));
}
