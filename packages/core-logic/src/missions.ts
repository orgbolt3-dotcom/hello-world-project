import type { MissionAction, MissionRecord, UserId } from "@eco/core-contracts";

export type MissionTransitionPatch = Pick<MissionRecord, "status" | "assigneeId">;

function denied(action: MissionAction["type"]): never {
  throw new Error(`Mission action is not allowed: ${action}.`);
}

/**
 * Authoritative client-side projection of the mission state machine.
 * PostgreSQL repeats these checks and remains the security boundary.
 */
export function missionTransition(
  mission: MissionRecord,
  action: MissionAction,
  actorId: UserId,
): MissionTransitionPatch {
  const isAuthor = mission.authorId === actorId;

  const isAssignee = mission.assigneeId === actorId;

  switch (action.type) {
    case "assign": {
      if (
        !isAuthor ||
        mission.status !== "open" ||
        mission.assigneeId !== null ||
        action.assigneeId === actorId
      ) {
        return denied(action.type);
      }

      return {
        status: "assigned",
        assigneeId: action.assigneeId,
      };
    }

    case "decline": {
      if (!isAssignee || mission.status !== "assigned") {
        return denied(action.type);
      }

      return {
        status: "open",
        assigneeId: null,
      };
    }

    case "start": {
      if (!isAssignee || mission.status !== "assigned") {
        return denied(action.type);
      }

      return {
        status: "in_progress",
        assigneeId: mission.assigneeId,
      };
    }

    case "submit_result": {
      if (!isAssignee || mission.status !== "in_progress") {
        return denied(action.type);
      }

      return {
        status: "pending_validation",
        assigneeId: mission.assigneeId,
      };
    }

    case "validate_result": {
      if (!isAuthor || mission.status !== "pending_validation") {
        return denied(action.type);
      }

      return {
        status: "completed",
        assigneeId: mission.assigneeId,
      };
    }

    case "dispute": {
      if (
        (!isAuthor && !isAssignee) ||
        (mission.status !== "in_progress" && mission.status !== "pending_validation")
      ) {
        return denied(action.type);
      }

      return {
        status: "disputed",
        assigneeId: mission.assigneeId,
      };
    }

    case "cancel": {
      if (!isAuthor || (mission.status !== "open" && mission.status !== "assigned")) {
        return denied(action.type);
      }

      return {
        status: "cancelled",
        assigneeId: mission.assigneeId,
      };
    }
  }
}

export function canEditMissionDetails(mission: MissionRecord, actorId: UserId): boolean {
  return mission.authorId === actorId && mission.status === "open" && mission.assigneeId === null;
}

export function canRemoveMission(mission: MissionRecord, actorId: UserId): boolean {
  return mission.authorId === actorId && mission.status === "open";
}

export function isMissionOverdue(mission: MissionRecord, now = Date.now()): boolean {
  if (mission.dueAt === null) {
    return false;
  }

  if (
    mission.status === "completed" ||
    mission.status === "cancelled" ||
    mission.status === "disputed"
  ) {
    return false;
  }

  return mission.dueAt < now;
}

/** Missions still requiring attention, most urgent first. */
export function sortMissionsByUrgency(missions: MissionRecord[]): MissionRecord[] {
  return [...missions].sort((a, b) => {
    const aDue = a.dueAt ?? Number.MAX_SAFE_INTEGER;

    const bDue = b.dueAt ?? Number.MAX_SAFE_INTEGER;

    return aDue - bDue;
  });
}
