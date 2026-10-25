import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Calls a backend database function that is not part of the generated types
 * yet (domain functions shipped by the app's own migrations).
 * Keeps the escape hatch in one audited place instead of scattering casts.
 */
export async function callAppRpc<T>(
  client: SupabaseClient<never>,
  fn: string,
  args: Record<string, unknown>,
): Promise<T> {
  const invoke = client.rpc.bind(client) as unknown as (
    name: string,
    params: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;

  const { data, error } = await invoke(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}
