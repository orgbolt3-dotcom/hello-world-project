/**
 * Feed foundation — generic stream of typed items.
 *
 * Each domain registers a FeedSource that yields items. The Feed UI
 * doesn't know about any business logic — it just renders what sources
 * produce, in time order. Sources are registered, not imported.
 */

export interface FeedItem<T = unknown> {
  id: string;
  /** Source key — e.g. "flash", "radar", "talents". */
  source: string;
  /** Higher = surfaces earlier when timestamps tie. */
  weight?: number;
  /** Unix ms; default = registration time. */
  ts: number;
  payload: T;
}

export interface FeedSource {
  key: string;
  load: () => Promise<FeedItem[]>;
}

const sources = new Map<string, FeedSource>();

export function registerFeedSource(source: FeedSource) {
  sources.set(source.key, source);
}

export function unregisterFeedSource(key: string) {
  sources.delete(key);
}

export async function loadFeed(): Promise<FeedItem[]> {
  const all = await Promise.all([...sources.values()].map((s) => s.load().catch(() => [])));
  return all.flat().sort((a, b) => b.ts - a.ts || (b.weight ?? 0) - (a.weight ?? 0));
}
