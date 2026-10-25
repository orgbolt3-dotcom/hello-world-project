import type { MissionAction, MissionId, MissionRecord, UserId } from "@eco/core-contracts";
import { asId } from "@eco/core-contracts";
import {
  canEditMissionDetails,
  canRemoveMission,
  missionTransition,
  stampUpdate,
} from "@eco/core-logic";
import { enqueueMutation } from "./outbox";
import { createRepository } from "./repository";
import { getDb, requireLocalDataOwnerId } from "./schema";

export interface CreateMissionInput {
  id?: MissionId;
  title: string;
  brief: string;
  rewardAmount: number;
  rewardCurrency?: string;
  dueAt: number | null;
}

export type MissionDetailsPatch = Partial<
  Pick<MissionRecord, "title" | "brief" | "rewardAmount" | "rewardCurrency" | "dueAt">
>;

const base = createRepository<MissionRecord>("missions");

function actorId(): UserId {
  const owner = requireLocalDataOwnerId();

  if (owner.startsWith("guest:")) {
    throw new Error("Authentication is required for mission actions.");
  }

  return asId<"UserId">(owner);
}

async function execute(id: MissionId, action: MissionAction): Promise<MissionRecord> {
  const db = getDb();

  const current = await db.missions.get(id);

  if (!current || current.deletedAt !== null) {
    throw new Error(`No local mission ${id}.`);
  }

  const patch = missionTransition(current, action, actorId());

  const next = stampUpdate({
    ...current,
    ...patch,
  });

  await db.transaction("rw", db.missions, db.outbox, async () => {
    await db.missions.put(next);

    await enqueueMutation({
      table: "missions",
      recordId: id,
      kind: "update",
      patch,
      mutatedAt: next.updatedAt,
    });
  });

  return next;
}

export const missionsRepository = {
  table: "missions" as const,

  get: base.get,
  list: base.list,

  create(input: CreateMissionInput): Promise<MissionRecord> {
    const owner = actorId();

    return base.create({
      id: input.id,
      authorId: owner,
      assigneeId: null,
      title: input.title,
      brief: input.brief,
      status: "open",
      rewardAmount: input.rewardAmount,
      rewardCurrency: input.rewardCurrency ?? "XAF",
      dueAt: input.dueAt,
    });
  },

  async editDetails(id: MissionId, patch: MissionDetailsPatch): Promise<MissionRecord> {
    const current = await base.get(id);

    if (!current) {
      throw new Error(`No local mission ${id}.`);
    }

    if (!canEditMissionDetails(current, actorId())) {
      throw new Error("Mission details can no longer be edited.");
    }

    return base.update(id, patch);
  },

  assign(id: MissionId, assigneeId: UserId) {
    return execute(id, {
      type: "assign",
      assigneeId,
    });
  },

  decline(id: MissionId) {
    return execute(id, {
      type: "decline",
    });
  },

  start(id: MissionId) {
    return execute(id, {
      type: "start",
    });
  },

  submitResult(id: MissionId) {
    return execute(id, {
      type: "submit_result",
    });
  },

  validateResult(id: MissionId) {
    return execute(id, {
      type: "validate_result",
    });
  },

  dispute(id: MissionId) {
    return execute(id, {
      type: "dispute",
    });
  },

  cancel(id: MissionId) {
    return execute(id, {
      type: "cancel",
    });
  },

  async remove(id: MissionId): Promise<void> {
    const current = await base.get(id);

    if (!current) return;

    if (!canRemoveMission(current, actorId())) {
      throw new Error("Only an open, unassigned mission can be removed.");
    }

    await base.remove(id);
  },
};
