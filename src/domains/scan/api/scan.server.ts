import { createClient } from "@supabase/supabase-js";
import type { ScanQuery, ScanResult } from "@eco/core-contracts";
import type { Database } from "@/integrations/supabase/types";
import { getPublicServerEnvironment } from "@/config/env.server";
import { callAppRpc } from "@/lib/api/rpc.server";

interface ScanRow {
  id: string;
  kind: string;
  category: string;
  title: string;
  time_slot: string;
  area_label: string;
  distance_km: number;
  created_at: number;
  expires_at: number;
}

/**
 * Public proximity search. Runs against the backend projection that never
 * exposes a precise position, only a distance and an area label.
 */
export async function scanPublicFlashes(query: ScanQuery): Promise<ScanResult[]> {
  const { supabaseUrl, supabasePublishableKey } = getPublicServerEnvironment();
  const client = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = await callAppRpc<ScanRow[]>(client, "scan_public_flashes", {
    p_text: query.text,
    p_category: query.category,
    p_latitude: query.latitude,
    p_longitude: query.longitude,
    p_radius_km: query.radiusKm,
    p_limit: query.limit,
  });

  return (rows ?? []).map((row) => ({
    id: row.id,
    kind: row.kind as ScanResult["kind"],
    category: row.category as ScanResult["category"],
    title: row.title,
    timeSlot: row.time_slot as ScanResult["timeSlot"],
    areaLabel: row.area_label,
    distanceKm: row.distance_km,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }));
}
