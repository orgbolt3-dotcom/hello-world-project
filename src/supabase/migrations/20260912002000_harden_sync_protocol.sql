-- Durable idempotence for offline mutations. Application-table RLS still
-- authorizes every underlying business write.

CREATE TABLE IF NOT EXISTS public.sync_mutation_receipts (
  mutation_id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logical_table TEXT NOT NULL CHECK (
    logical_table IN ('users', 'udi', 'flashes', 'missions', 'posts', 'media', 'notifications', 'audit')
  ),
  record_id UUID NOT NULL,
  response JSONB,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_mutation_receipts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.sync_mutation_receipts FROM anon, authenticated;
GRANT SELECT, INSERT ON public.sync_mutation_receipts TO authenticated;
GRANT ALL ON public.sync_mutation_receipts TO service_role;

DROP POLICY IF EXISTS "owners read sync receipts" ON public.sync_mutation_receipts;
CREATE POLICY "owners read sync receipts"
  ON public.sync_mutation_receipts
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "owners insert sync receipts" ON public.sync_mutation_receipts;
CREATE POLICY "owners insert sync receipts"
  ON public.sync_mutation_receipts
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_sync_receipts_owner_accepted
  ON public.sync_mutation_receipts (owner_id, accepted_at DESC);

COMMENT ON TABLE public.sync_mutation_receipts IS
  'Idempotency receipts for accepted offline mutations; purge only after the supported retry window.';
