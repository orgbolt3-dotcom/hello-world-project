BEGIN;

CREATE TABLE public.radars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  query TEXT NOT NULL,
  category TEXT,
  area_label TEXT NOT NULL,
  radius_km INTEGER NOT NULL DEFAULT 5,
  starts_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  next_review_at BIGINT,
  last_reviewed_at BIGINT,
  created_at BIGINT NOT NULL DEFAULT (extract(epoch FROM now()) * 1000)::bigint,
  updated_at BIGINT NOT NULL DEFAULT (extract(epoch FROM now()) * 1000)::bigint,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT radars_title_length CHECK (char_length(btrim(title)) BETWEEN 3 AND 160),
  CONSTRAINT radars_query_length CHECK (char_length(btrim(query)) BETWEEN 3 AND 2000),
  CONSTRAINT radars_area_length CHECK (char_length(btrim(area_label)) BETWEEN 2 AND 80),
  CONSTRAINT radars_category CHECK (category IS NULL OR category IN (
    'personal', 'professional', 'commercial', 'home', 'transport',
    'food', 'education', 'health', 'events', 'other'
  )),
  CONSTRAINT radars_radius CHECK (radius_km IN (1, 3, 5, 10, 25, 50)),
  CONSTRAINT radars_status CHECK (status IN (
    'draft', 'active', 'watching', 'matched', 'paused', 'expired', 'cancelled'
  )),
  CONSTRAINT radars_duration CHECK (
    expires_at - starts_at BETWEEN 259200000 AND 7776000000
  ),
  CONSTRAINT radars_review_order CHECK (
    next_review_at IS NULL OR next_review_at <= expires_at
  )
);

ALTER TABLE public.radars ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.radars FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.radars TO authenticated;
GRANT UPDATE (
  title, query, category, area_label, radius_km, starts_at, expires_at
) ON public.radars TO authenticated;
GRANT ALL ON public.radars TO service_role;

CREATE POLICY "owner reads radar"
  ON public.radars
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "owner creates radar draft"
  ON public.radars
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND status = 'draft'
    AND next_review_at IS NULL
    AND last_reviewed_at IS NULL
    AND deleted_at IS NULL
  );

CREATE POLICY "owner edits radar draft"
  ON public.radars
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() AND status = 'draft' AND deleted_at IS NULL)
  WITH CHECK (owner_id = auth.uid() AND status = 'draft' AND deleted_at IS NULL);

CREATE OR REPLACE FUNCTION public.protect_radar_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF current_user IS DISTINCT FROM 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.owner_id IS DISTINCT FROM auth.uid()
      OR NEW.status <> 'draft'
      OR NEW.next_review_at IS NOT NULL
      OR NEW.last_reviewed_at IS NOT NULL
      OR NEW.deleted_at IS NOT NULL
    THEN
      RAISE EXCEPTION 'invalid_radar_creation' USING ERRCODE = '42501';
    END IF;
    NEW.created_at := (extract(epoch FROM clock_timestamp()) * 1000)::bigint;
    NEW.updated_at := NEW.created_at;
    RETURN NEW;
  END IF;

  IF OLD.owner_id IS DISTINCT FROM auth.uid()
    OR OLD.status <> 'draft'
    OR NEW.id IS DISTINCT FROM OLD.id
    OR NEW.owner_id IS DISTINCT FROM OLD.owner_id
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.next_review_at IS DISTINCT FROM OLD.next_review_at
    OR NEW.last_reviewed_at IS DISTINCT FROM OLD.last_reviewed_at
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
  THEN
    RAISE EXCEPTION 'protected_radar_field' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_radar_fields() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER a_protect_radar_fields
  BEFORE INSERT OR UPDATE ON public.radars
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_radar_fields();

CREATE TRIGGER radars_revision
  BEFORE INSERT OR UPDATE ON public.radars
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_sync_revision();

CREATE OR REPLACE FUNCTION public.command_radar(p_radar_id UUID, p_action TEXT)
RETURNS public.radars
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  radar public.radars;
  now_ms BIGINT := (extract(epoch FROM clock_timestamp()) * 1000)::bigint;
BEGIN
  SELECT * INTO radar
  FROM public.radars
  WHERE id = p_radar_id
    AND owner_id = auth.uid()
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'radar_not_found' USING ERRCODE = '42501';
  END IF;

  IF radar.expires_at <= now_ms AND p_action <> 'cancel' THEN
    UPDATE public.radars
    SET status = 'expired', next_review_at = NULL
    WHERE id = radar.id
    RETURNING * INTO radar;
  ELSIF p_action = 'activate' AND radar.status = 'draft' THEN
    IF radar.expires_at - now_ms NOT BETWEEN 259200000 AND 7776000000 THEN
      RAISE EXCEPTION 'invalid_radar_schedule' USING ERRCODE = '22023';
    END IF;
    UPDATE public.radars
    SET status = 'active',
        next_review_at = least(now_ms + 604800000, expires_at),
        last_reviewed_at = NULL
    WHERE id = radar.id
    RETURNING * INTO radar;
  ELSIF p_action = 'pause' AND radar.status IN ('active', 'watching', 'matched') THEN
    UPDATE public.radars SET status = 'paused', next_review_at = NULL
    WHERE id = radar.id RETURNING * INTO radar;
  ELSIF p_action = 'resume' AND radar.status = 'paused' THEN
    UPDATE public.radars
    SET status = 'active', next_review_at = least(now_ms + 604800000, expires_at)
    WHERE id = radar.id RETURNING * INTO radar;
  ELSIF p_action = 'revalidate' AND radar.status IN ('active', 'watching', 'matched') THEN
    UPDATE public.radars
    SET last_reviewed_at = now_ms,
        next_review_at = least(now_ms + 604800000, expires_at)
    WHERE id = radar.id RETURNING * INTO radar;
  ELSIF p_action = 'cancel' AND radar.status NOT IN ('expired', 'cancelled') THEN
    UPDATE public.radars SET status = 'cancelled', next_review_at = NULL
    WHERE id = radar.id RETURNING * INTO radar;
  ELSE
    RAISE EXCEPTION 'invalid_radar_transition' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.audit (actor_id, action, target_table, target_id, summary)
  VALUES (
    auth.uid(),
    'radar.command.' || p_action,
    'radars',
    radar.id,
    'Radar command applied: ' || p_action
  );

  RETURN radar;
END;
$$;

REVOKE ALL ON FUNCTION public.command_radar(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.command_radar(UUID, TEXT) TO authenticated;

CREATE INDEX idx_radars_owner_status
  ON public.radars (owner_id, status, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_radars_due_review
  ON public.radars (next_review_at)
  WHERE deleted_at IS NULL
    AND status IN ('active', 'watching', 'matched')
    AND next_review_at IS NOT NULL;

CREATE INDEX idx_radars_expiration
  ON public.radars (expires_at)
  WHERE deleted_at IS NULL
    AND status NOT IN ('expired', 'cancelled');

COMMIT;
