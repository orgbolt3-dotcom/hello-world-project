/** Branded identifiers — prevent passing a user id where a mission id is expected. */

declare const brand: unique symbol;

export type Branded<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Branded<string, "UserId">;
export type UdiId = Branded<string, "UdiId">;
export type FlashId = Branded<string, "FlashId">;
export type MissionId = Branded<string, "MissionId">;
export type PostId = Branded<string, "PostId">;
export type MediaId = Branded<string, "MediaId">;
export type NotificationId = Branded<string, "NotificationId">;
export type AuditEntryId = Branded<string, "AuditEntryId">;
export type OutboxId = Branded<string, "OutboxId">;

/** Creates a new client-side identifier. Safe offline: no server round-trip. */
export function newId<T extends string>(): Branded<string, T> {
  return crypto.randomUUID() as Branded<string, T>;
}

/** Casts a raw string coming from the backend into a branded id. */
export function asId<T extends string>(value: string): Branded<string, T> {
  return value as Branded<string, T>;
}
