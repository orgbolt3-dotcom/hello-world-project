/// <reference lib="webworker" />

/**
 * The synchronisation worker.
 *
 * It is the ONLY place that talks to both the local database and the Cloud.
 * It runs off the main thread, so the interface stays smooth even while a
 * large backlog of offline work is being sent.
 */

import type { LocalDataScope, SyncWorkerCommand, SyncWorkerEvent } from "@eco/core-contracts";
import {
  applyRemoteRecords,
  applyPullPage,
  countPending,
  dropAccepted,
  markAttemptFailed,
  quarantineRejected,
  quarantineExhausted,
  readCursors,
  readPending,
  writeCursor,
  configureLocalDatabase,
  closeLocalDatabase,
} from "@eco/core-db";
import { createHttpTransport, createSyncEngine, type SyncEngine } from "@eco/core-sync";

const scope = self as unknown as DedicatedWorkerGlobalScope;

let accessToken: string | null = null;
let activeScope: LocalDataScope | null = null;
let engine: SyncEngine | null = null;

function post(event: SyncWorkerEvent): void {
  scope.postMessage(event);
}

function buildEngine(): SyncEngine {
  return createSyncEngine({
    transport: createHttpTransport({
      baseUrl: "/api/sync",
      getAccessToken: () => accessToken,
    }),
    store: {
      readCursors,
      writeCursor,
      applyRemoteRecords,
      applyPullPage,
      readPending,
      dropAccepted,
      markAttemptFailed,
      quarantineRejected,
      quarantineExhausted,
      countPending,
    },
    onState: (state) => post({ type: "state", state }),
    onApplied: (tables) => post({ type: "applied", tables }),
  });
}

async function start(command: Extract<SyncWorkerCommand, { type: "start" }>) {
  engine?.stop();
  closeLocalDatabase();
  configureLocalDatabase(command.scope);
  activeScope = command.scope;
  accessToken = command.accessToken;
  engine = buildEngine();

  if (accessToken) {
    engine.start();
    return;
  }

  post({
    type: "state",
    state: {
      phase: "idle",
      pendingCount: await countPending(),
      lastSyncedAt: null,
      messageKey: null,
    },
  });
}

scope.addEventListener("message", (event: MessageEvent<SyncWorkerCommand>) => {
  const command = event.data;
  switch (command.type) {
    case "start":
      void start(command);
      break;
    case "token":
      if (!activeScope || command.ownerId !== activeScope.ownerId) {
        post({
          type: "state",
          state: {
            phase: "error",
            pendingCount: 0,
            lastSyncedAt: null,
            messageKey: "sync.signInNeeded",
          },
        });
        break;
      }
      accessToken = command.accessToken;
      if (command.accessToken) {
        engine?.start();
        void engine?.syncNow();
      } else {
        engine?.stop();
      }
      break;
    case "sync-now":
      if (accessToken) void engine?.syncNow();
      break;
    case "stop":
      engine?.stop();
      closeLocalDatabase();
      engine = null;
      activeScope = null;
      accessToken = null;
      break;
  }
});
