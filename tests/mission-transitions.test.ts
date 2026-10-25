import { describe, expect, it } from "vitest";
import type { MissionRecord, UserId } from "@eco/core-contracts";
import { missionTransition } from "@eco/core-logic";

const authorId = "00000000-0000-4000-8000-000000000001" as UserId;
const assigneeId = "00000000-0000-4000-8000-000000000002" as UserId;
const strangerId = "00000000-0000-4000-8000-000000000003" as UserId;

function mission(overrides: Partial<MissionRecord> = {}): MissionRecord {
  return {
    id: "00000000-0000-4000-8000-000000000010" as MissionRecord["id"],
    authorId,
    assigneeId: null,
    title: "Livrer un colis",
    brief: "Livraison dans le quartier",
    status: "open",
    rewardAmount: 1_000,
    rewardCurrency: "XAF",
    dueAt: null,
    createdAt: 1,
    updatedAt: 1,
    deletedAt: null,
    revision: 1,
    ...overrides,
  };
}

describe("transitions métier des missions", () => {
  it("permet à l'auteur d'assigner un autre membre", () => {
    expect(missionTransition(mission(), { type: "assign", assigneeId }, authorId)).toEqual({
      status: "assigned",
      assigneeId,
    });
  });

  it("interdit à un tiers de démarrer la mission", () => {
    expect(() =>
      missionTransition(mission({ status: "assigned", assigneeId }), { type: "start" }, strangerId),
    ).toThrow("Mission action is not allowed");
  });

  it("réserve la validation finale à l'auteur", () => {
    const pending = mission({ status: "pending_validation", assigneeId });
    expect(() => missionTransition(pending, { type: "validate_result" }, assigneeId)).toThrow();
    expect(missionTransition(pending, { type: "validate_result" }, authorId).status).toBe(
      "completed",
    );
  });
});
