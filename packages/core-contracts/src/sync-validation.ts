import {
  SYNCED_TABLES,
  SYNC_PROTOCOL_VERSION,
  type JsonValue,
  type OutboxEntry,
  type PullRequest,
  type PullResult,
  type PushRequest,
  type PushResult,
  type SyncRecordEnvelope,
  type SyncedTable,
} from "./sync";
import { CLIENT_WRITE_POLICY, clientWritableFields } from "./write-policy";

export const MAX_PUSH_ENTRIES = 50;
export const MAX_PULL_LIMIT = 100;
export const MAX_SYNC_BODY_BYTES = 256 * 1024;
export const MAX_PATCH_FIELDS = 16;
export const MAX_JSON_DEPTH = 5;
export const MAX_STRING_LENGTH = 10_000;
export const MAX_ARRAY_LENGTH = 32;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_KEY = /^[A-Za-z][A-Za-z0-9]*$/;
const MAX_SAFE_REVISION = Number.MAX_SAFE_INTEGER;

export class SyncValidationError extends Error {
  readonly code = "invalid_sync_payload";

  constructor(message: string) {
    super(message);
    this.name = "SyncValidationError";
  }
}

function fail(message: string): never {
  throw new SyncValidationError(message);
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object.`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(`${label} has an invalid prototype.`);
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
): void {
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (unknown.length > 0) fail(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

function string(
  value: unknown,
  label: string,
  options: { min?: number; max?: number; pattern?: RegExp } = {},
): string {
  if (typeof value !== "string") fail(`${label} must be a string.`);
  const min = options.min ?? 0;
  const max = options.max ?? MAX_STRING_LENGTH;
  if (value.length < min || value.length > max) fail(`${label} has an invalid length.`);
  if (options.pattern && !options.pattern.test(value)) fail(`${label} has an invalid format.`);
  return value;
}

function integer(value: unknown, label: string, min = 0): number {
  if (!Number.isSafeInteger(value) || (value as number) < min) {
    fail(`${label} must be a safe integer greater than or equal to ${min}.`);
  }
  return value as number;
}

function finiteNumber(
  value: unknown,
  label: string,
  min = 0,
  max = Number.POSITIVE_INFINITY,
): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    fail(`${label} must be a finite number between ${min} and ${max}.`);
  }
  return value;
}

function nullableInteger(value: unknown, label: string): number | null {
  return value === null ? null : integer(value, label);
}

function uuid(value: unknown, label: string): string {
  return string(value, label, { min: 36, max: 36, pattern: UUID });
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    fail(`${label} has an unsupported value.`);
  }
  return value as T;
}

function numberEnum<T extends number>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value !== "number" || !allowed.includes(value as T)) {
    fail(`${label} has an unsupported value.`);
  }
  return value as T;
}

function stringArray(value: unknown, label: string, itemsAreUuid = false): string[] {
  if (!Array.isArray(value) || value.length > MAX_ARRAY_LENGTH) {
    fail(`${label} must be an array with at most ${MAX_ARRAY_LENGTH} items.`);
  }
  return value.map((item, index) =>
    itemsAreUuid
      ? uuid(item, `${label}[${index}]`)
      : string(item, `${label}[${index}]`, { max: 200 }),
  );
}

function jsonValue(value: unknown, label: string, depth = 0): JsonValue {
  if (depth > MAX_JSON_DEPTH) fail(`${label} is too deeply nested.`);
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") return string(value, label);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail(`${label} contains a non-finite number.`);
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) fail(`${label} contains too many items.`);
    return value.map((item, index) => jsonValue(item, `${label}[${index}]`, depth + 1));
  }
  const raw = object(value, label);
  if (Object.keys(raw).length > MAX_PATCH_FIELDS) fail(`${label} contains too many fields.`);
  const result: Record<string, JsonValue> = {};
  for (const [key, item] of Object.entries(raw)) {
    if (!SAFE_KEY.test(key)) fail(`${label} contains an invalid key.`);
    result[key] = jsonValue(item, `${label}.${key}`, depth + 1);
  }
  return result;
}

function validateField(table: SyncedTable, field: string, value: unknown): unknown {
  const label = `${table}.${field}`;
  switch (`${table}.${field}`) {
    case "users.displayName":
      return string(value, label, { max: 120 });
    case "users.handle":
      return string(value, label, { min: 3, max: 40, pattern: /^[a-z0-9._-]+$/i });
    case "users.avatarMediaId":
      return value === null ? null : uuid(value, label);
    case "users.locale":
      return string(value, label, { min: 2, max: 16, pattern: /^[a-z]{2,3}(?:-[A-Z]{2})?$/ });
    case "flashes.title":
      return string(value, label, { min: 1, max: 160 });
    case "flashes.body":
      return string(value, label, { max: 5_000 });
    case "flashes.kind":
      return enumValue(value, ["need", "offer"], label);
    case "flashes.category":
      return enumValue(
        value,
        [
          "personal",
          "professional",
          "commercial",
          "home",
          "transport",
          "food",
          "education",
          "health",
          "events",
          "other",
        ],
        label,
      );
    case "flashes.timeSlot":
      return enumValue(value, ["now", "morning", "afternoon", "evening"], label);
    case "flashes.areaLabel":
      return string(value, label, { min: 2, max: 80 });
    case "flashes.responseLimit":
      return finiteNumber(value, label, 1, 12);
    case "flashes.status":
      return enumValue(value, ["draft", "live", "expired", "archived"], label);
    case "flashes.expiresAt":
      return nullableInteger(value, label);
    case "flashes.mediaIds":
      return stringArray(value, label, true);
    case "missions.title":
      return string(value, label, { min: 1, max: 160 });
    case "missions.brief":
      return string(value, label, { min: 1, max: 5_000 });
    case "missions.status":
      return enumValue(
        value,
        [
          "open",
          "assigned",
          "in_progress",
          "pending_validation",
          "completed",
          "disputed",
          "cancelled",
        ],
        label,
      );
    case "missions.assigneeId":
      return value === null ? null : uuid(value, label);
    case "missions.rewardAmount":
      return finiteNumber(value, label, 0);
    case "missions.rewardCurrency":
      return enumValue(value, ["XAF"], label);
    case "missions.dueAt":
      return nullableInteger(value, label);
    case "radars.title":
      return string(value, label, { min: 3, max: 160 });
    case "radars.query":
      return string(value, label, { min: 3, max: 2_000 });
    case "radars.category":
      return value === null
        ? null
        : enumValue(
            value,
            [
              "personal",
              "professional",
              "commercial",
              "home",
              "transport",
              "food",
              "education",
              "health",
              "events",
              "other",
            ],
            label,
          );
    case "radars.areaLabel":
      return string(value, label, { min: 2, max: 80 });
    case "radars.radiusKm":
      return numberEnum(value, [1, 3, 5, 10, 25, 50], label);
    case "radars.startsAt":
      return integer(value, label);
    case "radars.expiresAt":
      return integer(value, label, 1);
    case "radars.status":
      return enumValue(value, ["draft"], label);
    case "posts.body":
      return string(value, label, { min: 1, max: 10_000 });
    case "posts.visibility":
      return enumValue(value, ["public", "circle", "private"], label);
    case "posts.mediaIds":
      return stringArray(value, label, true);
    case "media.kind":
      return enumValue(value, ["image", "video", "audio", "document"], label);
    case "media.state":
      return enumValue(value, ["local", "uploading", "remote", "failed"], label);
    case "media.remotePath":
      return value === null ? null : string(value, label, { max: 1_024 });
    case "media.mimeType":
      return string(value, label, { min: 1, max: 160, pattern: /^[\w.+-]+\/[\w.+-]+$/ });
    case "media.byteSize":
      return integer(value, label);
    case "media.width":
    case "media.height":
      return value === null ? null : integer(value, label, 1);
    case "notifications.readAt":
      return nullableInteger(value, label);
    default:
      fail(`${label} is not writable.`);
  }
}

export function isSyncedTable(value: unknown): value is SyncedTable {
  return typeof value === "string" && (SYNCED_TABLES as readonly string[]).includes(value);
}

export function validateMutationPatch(
  table: SyncedTable,
  kind: OutboxEntry["kind"],
  input: unknown,
): Record<string, unknown> {
  const raw = object(input, `${table} patch`);
  if (Object.keys(raw).length > MAX_PATCH_FIELDS) fail(`${table} patch contains too many fields.`);
  if (kind === "delete") {
    if (Object.keys(raw).some((field) => field !== "deletedAt"))
      fail("Delete patch contains forbidden fields.");
    if ("deletedAt" in raw) nullableInteger(raw.deletedAt, `${table}.deletedAt`);
    return {};
  }
  const allowed = new Set(clientWritableFields(table));
  const result: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(raw)) {
    if (!allowed.has(field)) fail(`${table}.${field} is not writable.`);
    result[field] = validateField(table, field, value);
  }
  if (kind === "update" && Object.keys(result).length === 0) fail("Update patch cannot be empty.");
  if (kind === "create") {
    if (!CLIENT_WRITE_POLICY[table].create) fail(`Creation is not allowed for ${table}.`);
    const required: Partial<Record<SyncedTable, readonly string[]>> = {
      flashes: ["title", "body", "status", "expiresAt", "mediaIds"],
      missions: [
        "title",
        "brief",
        "status",
        "rewardAmount",
        "rewardCurrency",
        "dueAt",
        "assigneeId",
      ],
      radars: [
        "title",
        "query",
        "category",
        "areaLabel",
        "radiusKm",
        "startsAt",
        "expiresAt",
        "status",
      ],
      posts: ["body", "visibility", "mediaIds"],
      media: ["kind", "state", "remotePath", "mimeType", "byteSize", "width", "height"],
    };
    const missing = (required[table] ?? []).filter((field) => !(field in result));
    if (missing.length > 0) fail(`${table} creation is missing: ${missing.join(", ")}.`);
  }
  return result;
}

export function validatePushRequest(input: unknown): PushRequest {
  const raw = object(input, "push request");
  exactKeys(raw, ["protocolVersion", "entries"], "push request");
  if (raw.protocolVersion !== SYNC_PROTOCOL_VERSION) fail("Unsupported sync protocol version.");
  if (
    !Array.isArray(raw.entries) ||
    raw.entries.length === 0 ||
    raw.entries.length > MAX_PUSH_ENTRIES
  ) {
    fail(`entries must contain between 1 and ${MAX_PUSH_ENTRIES} mutations.`);
  }
  const ids = new Set<string>();
  const entries = raw.entries.map((value, index): OutboxEntry => {
    const entry = object(value, `entries[${index}]`);
    exactKeys(
      entry,
      [
        "id",
        "ownerId",
        "table",
        "recordId",
        "kind",
        "patch",
        "mutatedAt",
        "attempts",
        "lastAttemptAt",
        "lastError",
      ],
      `entries[${index}]`,
    );
    const id = uuid(entry.id, `entries[${index}].id`);
    if (ids.has(id)) fail(`Duplicate mutation id: ${id}.`);
    ids.add(id);
    if (!isSyncedTable(entry.table)) fail(`entries[${index}].table is invalid.`);
    const kind = enumValue(entry.kind, ["create", "update", "delete"], `entries[${index}].kind`);
    return {
      id,
      ownerId: uuid(entry.ownerId, `entries[${index}].ownerId`),
      table: entry.table,
      recordId: uuid(entry.recordId, `entries[${index}].recordId`),
      kind,
      patch: validateMutationPatch(entry.table, kind, entry.patch),
      mutatedAt: integer(entry.mutatedAt, `entries[${index}].mutatedAt`),
      attempts: integer(entry.attempts, `entries[${index}].attempts`),
      lastAttemptAt:
        entry.lastAttemptAt === null
          ? null
          : integer(entry.lastAttemptAt, `entries[${index}].lastAttemptAt`),
      lastError:
        entry.lastError === null
          ? null
          : string(entry.lastError, `entries[${index}].lastError`, { max: 120 }),
    };
  });
  return { protocolVersion: SYNC_PROTOCOL_VERSION, entries };
}

export function validatePullRequest(input: unknown): PullRequest {
  const raw = object(input, "pull request");
  exactKeys(raw, ["protocolVersion", "cursors", "limit"], "pull request");
  if (raw.protocolVersion !== SYNC_PROTOCOL_VERSION) fail("Unsupported sync protocol version.");
  if (!Array.isArray(raw.cursors) || raw.cursors.length !== SYNCED_TABLES.length) {
    fail("Exactly one cursor per synced table is required.");
  }
  const seen = new Set<SyncedTable>();
  const cursors = raw.cursors.map((value, index) => {
    const cursor = object(value, `cursors[${index}]`);
    exactKeys(cursor, ["table", "revision"], `cursors[${index}]`);
    if (!isSyncedTable(cursor.table)) fail(`cursors[${index}].table is invalid.`);
    if (seen.has(cursor.table)) fail(`Duplicate cursor for ${cursor.table}.`);
    seen.add(cursor.table);
    return {
      table: cursor.table,
      revision: integer(cursor.revision, `cursors[${index}].revision`),
    };
  });
  return {
    protocolVersion: SYNC_PROTOCOL_VERSION,
    cursors,
    limit:
      integer(raw.limit, "limit", 1) <= MAX_PULL_LIMIT
        ? (raw.limit as number)
        : fail("Pull limit is too high."),
  };
}

export function validateSyncEnvelope(input: unknown, label = "record"): SyncRecordEnvelope {
  const raw = object(input, label);
  exactKeys(raw, ["table", "revision", "deleted", "data"], label);
  if (!isSyncedTable(raw.table)) fail(`${label}.table is invalid.`);
  if (typeof raw.deleted !== "boolean") fail(`${label}.deleted must be boolean.`);
  const data = jsonValue(raw.data, `${label}.data`);
  if (data === null || Array.isArray(data) || typeof data !== "object")
    fail(`${label}.data must be an object.`);
  uuid(data.id, `${label}.data.id`);
  return {
    table: raw.table,
    revision: integer(raw.revision, `${label}.revision`, 1),
    deleted: raw.deleted,
    data,
  };
}

export function validatePushResult(input: unknown, request: PushRequest): PushResult {
  const raw = object(input, "push result");
  exactKeys(raw, ["accepted", "rejected", "records"], "push result");
  if (!Array.isArray(raw.accepted) || !Array.isArray(raw.rejected) || !Array.isArray(raw.records))
    fail("Push result arrays are invalid.");
  const accepted = raw.accepted.map((id, i) => uuid(id, `accepted[${i}]`));
  const rejected = raw.rejected.map((value, i) => {
    const item = object(value, `rejected[${i}]`);
    exactKeys(item, ["id", "code", "retryable"], `rejected[${i}]`);
    if (typeof item.retryable !== "boolean") fail(`rejected[${i}].retryable must be boolean.`);
    return {
      id: uuid(item.id, `rejected[${i}].id`),
      code: enumValue(
        item.code,
        [
          "invalid_mutation",
          "owner_mismatch",
          "operation_not_allowed",
          "permission_denied",
          "conflict",
          "record_not_found",
          "server_error",
        ],
        `rejected[${i}].code`,
      ),
      retryable: item.retryable,
    };
  });
  const requestedIds = new Set(request.entries.map((entry) => entry.id));
  const resolvedIds = [...accepted, ...rejected.map((item) => item.id)];
  if (new Set(resolvedIds).size !== resolvedIds.length)
    fail("Push result contains duplicate mutation ids.");
  if (resolvedIds.some((id) => !requestedIds.has(id)))
    fail("Push result contains an unknown mutation id.");
  if (resolvedIds.length !== requestedIds.size)
    fail("Push result does not resolve every mutation.");
  const records = raw.records.map((record, i) => validateSyncEnvelope(record, `records[${i}]`));
  const acceptedRecords = new Set(
    request.entries
      .filter((entry) => accepted.includes(entry.id))
      .map((entry) => `${entry.table}:${entry.recordId}`),
  );
  if (records.some((record) => !acceptedRecords.has(`${record.table}:${record.data.id}`))) {
    fail("Push result contains a record unrelated to an accepted mutation.");
  }
  return { accepted, rejected, records };
}

export function validatePullResult(input: unknown, request: PullRequest): PullResult {
  const raw = object(input, "pull result");
  exactKeys(raw, ["records", "cursors", "hasMore"], "pull result");
  if (
    !Array.isArray(raw.records) ||
    !Array.isArray(raw.cursors) ||
    typeof raw.hasMore !== "boolean"
  )
    fail("Pull result is invalid.");
  const result = validatePullRequest({
    protocolVersion: SYNC_PROTOCOL_VERSION,
    cursors: raw.cursors,
    limit: request.limit,
  });
  const previous = new Map(request.cursors.map((cursor) => [cursor.table, cursor.revision]));
  for (const cursor of result.cursors) {
    if (cursor.revision < (previous.get(cursor.table) ?? 0) || cursor.revision > MAX_SAFE_REVISION)
      fail(`Cursor for ${cursor.table} is not monotonic.`);
  }
  const records = raw.records.map((record, i) => validateSyncEnvelope(record, `records[${i}]`));
  if (records.length > request.limit) fail("Pull result exceeds the requested page size.");
  const next = new Map(result.cursors.map((cursor) => [cursor.table, cursor.revision]));
  for (const record of records) {
    const lower = previous.get(record.table);
    const upper = next.get(record.table);
    if (
      lower === undefined ||
      upper === undefined ||
      record.revision <= lower ||
      record.revision > upper
    ) {
      fail(`Record revision for ${record.table} is outside its cursor window.`);
    }
  }
  return { records, cursors: result.cursors, hasMore: raw.hasMore };
}
