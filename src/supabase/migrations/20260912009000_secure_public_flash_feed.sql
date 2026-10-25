BEGIN;

DROP VIEW IF EXISTS public.public_flash_feed;

CREATE OR REPLACE FUNCTION public.list_public_flashes(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  kind TEXT,
  category TEXT,
  title TEXT,
  time_slot TEXT,
  area_label TEXT,
  expires_at BIGINT,
  created_at BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    f.id,
    f.kind,
    f.category,
    f.title,
    f.time_slot,
    f.area_label,
    f.expires_at,
    f.created_at
  FROM public.flashes AS f
  WHERE f.status = 'live'
    AND f.deleted_at IS NULL
    AND f.expires_at > (extract(epoch FROM now()) * 1000)::bigint
  ORDER BY f.created_at DESC, f.id
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 50)
$$;

REVOKE ALL ON FUNCTION public.list_public_flashes(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_flashes(INTEGER) TO anon, authenticated;

COMMENT ON FUNCTION public.list_public_flashes(INTEGER) IS
  'Public Flash projection. Excludes body, author identity, response limits and precise location.';

COMMIT;
