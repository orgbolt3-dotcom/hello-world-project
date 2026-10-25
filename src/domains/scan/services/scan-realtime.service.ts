import { supabase } from "@/integrations/supabase/client";

/**
 * Listens to public flash activity so an open scan stays current.
 * Returns the cleanup function expected by React effects.
 */
export function subscribeToFlashChanges(onChange: () => void): () => void {
  const channel = supabase
    .channel("scan-flashes")
    .on("postgres_changes", { event: "*", schema: "public", table: "flashes" }, () => onChange())
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
