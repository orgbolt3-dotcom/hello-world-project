-- Colonnes Flash attendues par les contrats (additif, nullable)
ALTER TABLE public.flashes
  ADD COLUMN IF NOT EXISTS kind TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS time_slot TEXT,
  ADD COLUMN IF NOT EXISTS area_label TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS accuracy_meters DOUBLE PRECISION;

-- Projection publique du fil Flash (sans auteur ni position précise)
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
  'Public Flash projection. Excludes body, author identity and precise location.';

-- Recherche publique de proximité (Scan) : distance uniquement, jamais de coordonnées
CREATE OR REPLACE FUNCTION public.scan_public_flashes(
  p_text TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_latitude DOUBLE PRECISION DEFAULT NULL,
  p_longitude DOUBLE PRECISION DEFAULT NULL,
  p_radius_km DOUBLE PRECISION DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  kind TEXT,
  category TEXT,
  title TEXT,
  time_slot TEXT,
  area_label TEXT,
  distance_km DOUBLE PRECISION,
  created_at BIGINT,
  expires_at BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH scoped AS (
    SELECT
      f.id,
      f.kind,
      f.category,
      f.title,
      f.time_slot,
      f.area_label,
      f.created_at,
      f.expires_at,
      (6371 * 2 * asin(sqrt(
        power(sin(radians(f.latitude - p_latitude) / 2), 2)
        + cos(radians(p_latitude)) * cos(radians(f.latitude))
        * power(sin(radians(f.longitude - p_longitude) / 2), 2)
      ))) AS distance_km
    FROM public.flashes AS f
    WHERE f.status = 'live'
      AND f.deleted_at IS NULL
      AND f.expires_at > (extract(epoch FROM now()) * 1000)::bigint
      AND f.latitude IS NOT NULL
      AND f.longitude IS NOT NULL
      AND p_latitude IS NOT NULL
      AND p_longitude IS NOT NULL
      AND (p_category IS NULL OR f.category = p_category)
      AND (
        p_text IS NULL
        OR f.title ILIKE '%' || p_text || '%'
        OR f.body ILIKE '%' || p_text || '%'
      )
  )
  SELECT
    s.id,
    s.kind,
    s.category,
    s.title,
    s.time_slot,
    s.area_label,
    s.distance_km,
    s.created_at,
    s.expires_at
  FROM scoped AS s
  WHERE p_radius_km IS NULL OR s.distance_km <= p_radius_km
  ORDER BY s.distance_km ASC, s.created_at DESC, s.id
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 50)
$$;

REVOKE ALL ON FUNCTION public.scan_public_flashes(TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.scan_public_flashes(TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO anon, authenticated;

COMMENT ON FUNCTION public.scan_public_flashes(TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) IS
  'Public proximity search over live flashes. Returns distance and area label only, never coordinates.';

-- Transition de statut réservée à l'auteur du Flash
CREATE OR REPLACE FUNCTION public.transition_flash(p_flash_id UUID, p_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF p_status NOT IN ('live', 'archived') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;
  UPDATE public.flashes
     SET status = p_status,
         updated_at = (extract(epoch FROM now()) * 1000)::bigint,
         server_updated_at = now()
   WHERE id = p_flash_id
     AND author_id = auth.uid()
     AND deleted_at IS NULL;
  RETURN FOUND;
END
$$;

REVOKE ALL ON FUNCTION public.transition_flash(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_flash(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.transition_flash(UUID, TEXT) IS
  'Author-only flash status transition (live/archived).';

-- Position précise privée, réservée à l'auteur du Flash
CREATE OR REPLACE FUNCTION public.set_flash_location(
  p_flash_id UUID,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_accuracy_meters DOUBLE PRECISION
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF p_latitude < -90 OR p_latitude > 90
     OR p_longitude < -180 OR p_longitude > 180
     OR p_accuracy_meters < 0 OR p_accuracy_meters > 5000 THEN
    RAISE EXCEPTION 'invalid_location';
  END IF;
  UPDATE public.flashes
     SET latitude = p_latitude,
         longitude = p_longitude,
         accuracy_meters = p_accuracy_meters,
         updated_at = (extract(epoch FROM now()) * 1000)::bigint,
         server_updated_at = now()
   WHERE id = p_flash_id
     AND author_id = auth.uid()
     AND deleted_at IS NULL;
  RETURN FOUND;
END
$$;

REVOKE ALL ON FUNCTION public.set_flash_location(UUID, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_flash_location(UUID, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

COMMENT ON FUNCTION public.set_flash_location(UUID, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) IS
  'Author-only private precise location for a flash. Never exposed by public projections.';