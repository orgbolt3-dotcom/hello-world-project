import { useEffect } from "react";
import type { SyncWorkerCommand, SyncWorkerEvent } from "@eco/core-contracts";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { resetSyncStatus, useSyncStatusStore } from "./sync-status";
import { activateLocalDataScope, deactivateLocalDataScope } from "./local-scope";

/**
 * Bridge between the application and the synchronisation worker.
 *
 * The application never synchronises anything itself: it only tells the worker
 * who is signed in and when it might be worth trying again.
 */

let worker: Worker | null = null;
let activeOwnerId: string | null = null;

function isSupported(): boolean {
  return typeof window !== "undefined" && typeof Worker !== "undefined";
}

function send(command: SyncWorkerCommand): void {
  worker?.postMessage(command);
}

/** Asks the worker to synchronise right now, if it is running. */
export function requestSyncNow(): void {
  send({
    type: "sync-now",
  });
}

function createWorker(): Worker | null {
  if (!isSupported()) return null;

  const created = new Worker(new URL("./sync.worker.ts", import.meta.url), {
    type: "module",
  });

  created.addEventListener("message", (event: MessageEvent<SyncWorkerEvent>) => {
    if (event.data.type === "state") {
      useSyncStatusStore.getState().setState(event.data.state);
    }
  });

  worker = created;

  return created;
}

function stopWorker(): void {
  if (!worker) return;

  worker.postMessage({
    type: "stop",
  } satisfies SyncWorkerCommand);

  worker.terminate();
  worker = null;
}

function applySession(session: Session | null): void {
  const userId = session?.user.id ?? null;
  const scope = activateLocalDataScope(userId);
  const accessToken = session?.access_token ?? null;

  if (worker && activeOwnerId === scope.ownerId) {
    send({
      type: "token",
      ownerId: scope.ownerId,
      accessToken,
    });

    return;
  }

  stopWorker();
  resetSyncStatus();

  activeOwnerId = scope.ownerId;

  const created = createWorker();

  created?.postMessage({
    type: "start",
    scope,
    accessToken,
  } satisfies SyncWorkerCommand);
}

/**
 * Runs the synchronisation for the whole session.
 * Mount this hook once at the application root.
 */
export function useSyncEngine(): void {
  useEffect(() => {
    if (!isSupported()) return;

    let cancelled = false;
    let receivedAuthEvent = false;

    void supabase.auth.getSession().then(({ data }) => {
      /*
       * An auth event may have arrived while getSession was resolving.
       * Never restore the older snapshot over a newer account state.
       */
      if (cancelled || receivedAuthEvent) {
        return;
      }

      applySession(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      receivedAuthEvent = true;

      if (!cancelled) {
        applySession(session);
      }
    });

    const wake = () => {
      requestSyncNow();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        requestSyncNow();
      }
    };

    window.addEventListener("online", wake);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;

      subscription.subscription.unsubscribe();

      window.removeEventListener("online", wake);

      document.removeEventListener("visibilitychange", onVisible);

      stopWorker();
      activeOwnerId = null;

      deactivateLocalDataScope();
      resetSyncStatus();
    };
  }, []);
}
