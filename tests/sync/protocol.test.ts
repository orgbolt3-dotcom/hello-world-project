import { describe, expect, it } from "vitest";
import {
  SYNC_PROTOCOL_VERSION,
  SyncValidationError,
  validatePullRequest,
  validatePullResult,
  validatePushRequest,
} from "@eco/core-contracts";

const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, "0")}`;

const mutation = {
  id: uuid(1),
  ownerId: uuid(2),
  table: "flashes",
  recordId: uuid(3),
  kind: "update",
  patch: { title: "updated" },
  mutatedAt: 1,
  attempts: 0,
  lastAttemptAt: null,
  lastError: null,
};

const cursors = [
  "users",
  "udi",
  "flashes",
  "missions",
  "radars",
  "posts",
  "media",
  "notifications",
  "audit",
].map((table) => ({ table, revision: 0 }));

describe("sync protocol validation", () => {
  it("accepts the current strict push contract", () => {
    const result = validatePushRequest({
      protocolVersion: SYNC_PROTOCOL_VERSION,
      entries: [mutation],
    });

    expect(result.entries[0].table).toBe("flashes");
  });

  it("rejects an unsupported protocol version", () => {
    expect(() => validatePushRequest({ protocolVersion: 1, entries: [mutation] })).toThrow(
      SyncValidationError,
    );
  });

  it("rejects unknown mutation fields", () => {
    expect(() =>
      validatePushRequest({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        entries: [{ ...mutation, unexpected: true }],
      }),
    ).toThrow(SyncValidationError);
  });

  it("rejects duplicate mutation ids", () => {
    expect(() =>
      validatePushRequest({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        entries: [mutation, { ...mutation }],
      }),
    ).toThrow(SyncValidationError);
  });

  it("rejects a mutation that tries to write a protected field", () => {
    expect(() =>
      validatePushRequest({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        entries: [{ ...mutation, patch: { revision: 999 } }],
      }),
    ).toThrow(SyncValidationError);
  });

  it("rejects an incomplete create mutation", () => {
    expect(() =>
      validatePushRequest({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        entries: [
          {
            ...mutation,
            id: uuid(4),
            kind: "create",
            patch: { title: "only a title" },
          },
        ],
      }),
    ).toThrow(SyncValidationError);
  });

  it("rejects duplicate pull cursors", () => {
    expect(() =>
      validatePullRequest({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        cursors: [...cursors.slice(0, -1), cursors[0]],
        limit: 10,
      }),
    ).toThrow(SyncValidationError);
  });

  it("rejects a pull result that moves a cursor backwards", () => {
    const request = validatePullRequest({
      protocolVersion: SYNC_PROTOCOL_VERSION,
      cursors: cursors.map((cursor) =>
        cursor.table === "flashes" ? { ...cursor, revision: 10 } : cursor,
      ),
      limit: 10,
    });

    expect(() =>
      validatePullResult(
        {
          records: [],
          cursors: cursors.map((cursor) =>
            cursor.table === "flashes" ? { ...cursor, revision: 9 } : cursor,
          ),
          hasMore: false,
        },
        request,
      ),
    ).toThrow(SyncValidationError);
  });

  it("rejects a pull result containing a record outside its cursor window", () => {
    const request = validatePullRequest({
      protocolVersion: SYNC_PROTOCOL_VERSION,
      cursors,
      limit: 10,
    });

    expect(() =>
      validatePullResult(
        {
          records: [
            {
              table: "flashes",
              revision: 11,
              deleted: false,
              data: { id: uuid(3), title: "updated" },
            },
          ],
          cursors: cursors.map((cursor) =>
            cursor.table === "flashes" ? { ...cursor, revision: 10 } : cursor,
          ),
          hasMore: false,
        },
        request,
      ),
    ).toThrow(SyncValidationError);
  });

  it("rejects a push result that resolves an unknown mutation id", async () => {
    const { validatePushResult } = await import("@eco/core-contracts");
    const request = validatePushRequest({
      protocolVersion: SYNC_PROTOCOL_VERSION,
      entries: [mutation],
    });

    expect(() =>
      validatePushResult(
        {
          accepted: [uuid(99)],
          rejected: [],
          records: [],
        },
        request,
      ),
    ).toThrow(SyncValidationError);
  });
});
