import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { ScanQuery, ScanResult } from "@eco/core-contracts";
import { rankScanResults } from "@eco/core-logic";
import { scanNearby } from "../api/scan.functions";
import { subscribeToFlashChanges } from "../services/scan-realtime.service";

export function useScan() {
  const run = useServerFn(scanNearby);
  const runRef = useRef(run);
  const queryRef = useRef<ScanQuery | undefined>(undefined);
  const inFlightRef = useRef(false);
  const [rows, setRows] = useState<ScanResult[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const execute = useCallback(async (query: ScanQuery) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    queryRef.current = query;
    setBusy(true);
    try {
      setRows(rankScanResults(await runRef.current({ data: query })));
    } finally {
      inFlightRef.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(
    () =>
      subscribeToFlashChanges(() => {
        const query = queryRef.current;
        if (query) void execute(query);
      }),
    [execute],
  );

  return { rows, busy, execute };
}
