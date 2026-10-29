import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { PublicFlash, ScanResult } from "@eco/core-contracts";
import { rankScanResults } from "@eco/core-logic";
import { flashesRepository, getLocalDataScope } from "@eco/core-db";
import { useLocalScopeRevision } from "@/platform/offline/local-scope";
import { hasClientConnection } from "@/config/env.public";
import { scanNearby } from "../api/scan.functions";
import { searchSavedFlashes, type ScanCriteria } from "../model/search";

export interface ScanSnapshot {
  criteria: ScanCriteria;
  rows: (PublicFlash & { distanceKm?: number })[];
  source: "saved" | "nearby";
  executedAt: number;
}

/** No mount fetch, subscription, automatic retry or persistent location. */
export function useVoluntaryScan() {
  const remote = useServerFn(scanNearby);
  const scopeRevision = useLocalScopeRevision();
  const token = useRef(0);
  const lock = useRef(false);
  const [snapshot, setSnapshot] = useState<ScanSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    token.current += 1;
    lock.current = false;
    setBusy(false);
    setSnapshot(null);
    setError(false);
    return () => { token.current += 1; };
  }, [scopeRevision]);

  async function execute(criteria: ScanCriteria, position?: { latitude: number; longitude: number; radiusKm: number }) {
    if (lock.current) return;
    lock.current = true;
    const request = ++token.current;
    const owner = getLocalDataScope()?.ownerId;
    setBusy(true);
    setError(false);
    setSnapshot(null);
    try {
      const now = Date.now();
      let rows: (PublicFlash & { distanceKm?: number })[];
      if (position) {
        if (!hasClientConnection() || !navigator.onLine) throw new Error("Search unavailable");
        const results: ScanResult[] = await remote({ data: { text: criteria.text.trim(), category: criteria.category,
          ...position, limit: 50 } });
        rows = rankScanResults(results.filter((row) => row.expiresAt > Date.now()));
      } else {
        if (!owner) throw new Error("Local scope unavailable");
        rows = searchSavedFlashes(await flashesRepository.list(), criteria, now);
      }
      if (request === token.current && owner === getLocalDataScope()?.ownerId) {
        setSnapshot({ criteria: { ...criteria }, rows, source: position ? "nearby" : "saved", executedAt: now });
      }
    } catch {
      if (request === token.current) setError(true);
    } finally {
      if (request === token.current) { lock.current = false; setBusy(false); }
    }
  }
  function reset() {
    token.current += 1;
    lock.current = false;
    setSnapshot(null);
    setError(false);
    setBusy(false);
  }
  return { snapshot, busy, error, execute, reset };
}