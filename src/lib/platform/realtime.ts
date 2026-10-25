/**
 * Realtime-ready foundation.
 *
 * Thin abstraction so any domain can subscribe to a channel without knowing
 * whether the transport is WebSocket, SSE, or mock (Phase 1 = mock only).
 * Backend wiring lands in a later phase; the interface stays stable.
 */

export type RealtimeEvent<T = unknown> = {
  channel: string;
  type: string;
  payload: T;
  ts: number;
};

type Handler = (event: RealtimeEvent) => void;

class RealtimeBus {
  private handlers = new Map<string, Set<Handler>>();

  subscribe(channel: string, handler: Handler): () => void {
    if (!this.handlers.has(channel)) this.handlers.set(channel, new Set());
    this.handlers.get(channel)!.add(handler);
    return () => this.handlers.get(channel)?.delete(handler);
  }

  emit(event: RealtimeEvent) {
    this.handlers.get(event.channel)?.forEach((h) => h(event));
    this.handlers.get("*")?.forEach((h) => h(event));
  }
}

export const realtime = new RealtimeBus();
