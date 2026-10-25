/**
 * Realtime presence foundation — placeholder.
 *
 * Uses the in-process RealtimeBus. When a real transport (WebSocket/SSE)
 * lands, it can publish into the same bus and presence consumers
 * keep working unchanged.
 */
import { useEffect, useState } from "react";
import { realtime } from "@/lib/platform/realtime";

export interface Presence {
  onlineCount: number;
  /** Last update timestamp (ms). */
  ts: number;
}

const PRESENCE_CHANNEL = "presence:global";

export function emitPresence(onlineCount: number) {
  realtime.emit({
    channel: PRESENCE_CHANNEL,
    type: "update",
    payload: { onlineCount, ts: Date.now() } satisfies Presence,
    ts: Date.now(),
  });
}

export function usePresence(): Presence | null {
  const [presence, setPresence] = useState<Presence | null>(null);
  useEffect(() => {
    return realtime.subscribe(PRESENCE_CHANNEL, (e) => {
      setPresence(e.payload as Presence);
    });
  }, []);
  return presence;
}
