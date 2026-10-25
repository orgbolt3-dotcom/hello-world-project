import type { AssistantFailure } from "@eco/core-contracts";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseLike = SupabaseClient;

export async function claimAssistantRequest(
  db: SupabaseLike,
  requestId: string,
  locale: "fr" | "en",
): Promise<{ allowed: true } | { allowed: false; reason: AssistantFailure }> {
  const { data, error } = await db.rpc("claim_assistant_request", {
    p_request_id: requestId,
    p_locale: locale,
  });
  if (error || !data || typeof data !== "object") {
    return { allowed: false, reason: "unavailable" };
  }
  const decision = (data as { decision?: string }).decision;
  if (decision === "allowed") return { allowed: true };
  if (decision === "rate_limited") return { allowed: false, reason: "rate_limited" };
  if (decision === "daily_limit") return { allowed: false, reason: "daily_limit" };
  return { allowed: false, reason: decision === "denied" ? "auth_required" : "invalid_request" };
}

export async function completeAssistantRequest(
  db: SupabaseLike,
  input: {
    requestId: string;
    source: "promoted_cache" | "gateway";
    inputChars: number;
    outputChars: number;
  },
): Promise<void> {
  await db.rpc("complete_assistant_request", {
    p_request_id: input.requestId,
    p_source: input.source,
    p_input_chars: input.inputChars,
    p_output_chars: input.outputChars,
  });
}

export async function failAssistantRequest(db: SupabaseLike, requestId: string): Promise<void> {
  await db.rpc("fail_assistant_request", { p_request_id: requestId });
}
