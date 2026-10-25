import { describe, expect, it } from "vitest";
import {
  SYNC_PROTOCOL_VERSION,
  SyncValidationError,
  validatePushRequest,
} from "@eco/core-contracts";

const mutation = {
  id: "00000000-0000-4000-8000-000000000001",
  ownerId: "00000000-0000-4000-8000-000000000002",
  table: "users",
  recordId: "00000000-0000-4000-8000-000000000002",
  kind: "update",
  patch: { displayName: "Amina" },
  mutatedAt: 1_700_000_000_000,
  attempts: 0,
  lastAttemptAt: null,
  lastError: null,
};

describe("validation du protocole de synchronisation", () => {
  it("accepte une mutation utilisateur minimale et autorisée", () => {
    const request = validatePushRequest({
      protocolVersion: SYNC_PROTOCOL_VERSION,
      entries: [mutation],
    });

    expect(request.entries).toHaveLength(1);
    expect(request.entries[0]?.patch).toEqual({ displayName: "Amina" });
  });

  it("rejette l'écriture d'un champ système", () => {
    expect(() =>
      validatePushRequest({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        entries: [{ ...mutation, patch: { trustLevel: "recommended" } }],
      }),
    ).toThrow(SyncValidationError);
  });

  it("rejette les champs de protocole inconnus", () => {
    expect(() =>
      validatePushRequest({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        entries: [mutation],
        administrativeOverride: true,
      }),
    ).toThrow("unknown fields");
  });
});
