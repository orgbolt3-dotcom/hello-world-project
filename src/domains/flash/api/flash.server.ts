import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PublicFlash } from "@eco/core-contracts";
import type { Database } from "@/integrations/supabase/types";
import { getPublicServerEnvironment } from "@/config/env.server";
import { callAppRpc } from "@/lib/api/rpc.server";

interface PublicFlashRow {
  id: string;
  kind: string;
  category: string;
  title: string;
  time_slot: string;
  area_label: string;
  expires_at: number;
  created_at: number;
}

export async function transitionFlash(
  client: SupabaseClient<Database>,
  id: string,
  status: "live" | "archived",
) {
  return callAppRpc<boolean>(client as never, "transition_flash", {
    p_flash_id: id,
    p_status: status,
  });
}

export async function publicFlashes(): Promise<PublicFlash[]> {
  const { supabaseUrl, supabasePublishableKey } = getPublicServerEnvironment();
  const client = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const rows = await callAppRpc<PublicFlashRow[]>(client as never, "list_public_flashes", {
    p_limit: 50,
  });
  return (rows ?? []).map((row) => ({
    id: row.id,
    kind: row.kind as PublicFlash["kind"],
    category: row.category as PublicFlash["category"],
    title: row.title,
    timeSlot: row.time_slot as PublicFlash["timeSlot"],
    areaLabel: row.area_label,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));
}

export async function setPrivateFlashLocation(
  client: SupabaseClient<Database>,
  input: { flashId: string; latitude: number; longitude: number; accuracyMeters: number },
) {
  await callAppRpc<null>(client as never, "set_flash_location", {
    p_flash_id: input.flashId,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
    p_accuracy_meters: input.accuracyMeters,
  });
  return true;
}
