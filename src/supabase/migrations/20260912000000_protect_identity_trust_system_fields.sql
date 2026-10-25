BEGIN;

-- =========================================================
-- Authoritative server timestamps
-- =========================================================

CREATE OR REPLACE FUNCTION public.assign_sync_revision()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.revision :=
    nextval(
      'public.sync_revision_seq'
    );

  NEW.updated_at :=
    (
      EXTRACT(
        EPOCH FROM clock_timestamp()
      ) * 1000
    )::BIGINT;

  NEW.server_updated_at :=
    clock_timestamp();

  RETURN NEW;
END;
$$;

REVOKE ALL
ON FUNCTION public.assign_sync_revision()
FROM PUBLIC, anon, authenticated;

-- =========================================================
-- Normalise existing values before adding constraints
-- =========================================================

UPDATE public.profiles
SET status = 'active'
WHERE status NOT IN (
  'active',
  'invited',
  'suspended',
  'closed'
);

UPDATE public.profiles
SET trust_score =
  LEAST(
    100,
    GREATEST(
      0,
      trust_score
    )
  );

UPDATE public.udi
SET level = 'guest'
WHERE level NOT IN (
  'guest',
  'identified',
  'verified',
  'trusted'
);

-- =========================================================
-- Domain constraints
-- =========================================================

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS
    profiles_status_check,
  DROP CONSTRAINT IF EXISTS
    profiles_trust_score_check,

  ADD CONSTRAINT
    profiles_status_check
    CHECK (
      status IN (
        'active',
        'invited',
        'suspended',
        'closed'
      )
    ),

  ADD CONSTRAINT
    profiles_trust_score_check
    CHECK (
      trust_score
      BETWEEN 0 AND 100
    );

ALTER TABLE public.udi
  DROP CONSTRAINT IF EXISTS
    udi_level_check,

  ADD CONSTRAINT
    udi_level_check
    CHECK (
      level IN (
        'guest',
        'identified',
        'verified',
        'trusted'
      )
    );

-- =========================================================
-- Profile privileges
-- =========================================================

REVOKE INSERT, UPDATE
ON public.profiles
FROM authenticated;

GRANT UPDATE (
  display_name,
  handle,
  avatar_media_id,
  locale
)
ON public.profiles
TO authenticated;

DROP POLICY IF EXISTS
  "own profile insert"
ON public.profiles;

-- The existing own-profile UPDATE RLS policy remains active.
-- Column privileges now restrict the exact editable fields.

-- =========================================================
-- UDI privileges and RLS
-- =========================================================

REVOKE INSERT, UPDATE, DELETE
ON public.udi
FROM authenticated;

GRANT SELECT
ON public.udi
TO authenticated;

DROP POLICY IF EXISTS
  "own identity insert"
ON public.udi;

DROP POLICY IF EXISTS
  "own identity update"
ON public.udi;

DROP POLICY IF EXISTS
  "own identity readable"
ON public.udi;

CREATE POLICY
  "identity readable by owner and administrators"
ON public.udi
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(
    auth.uid(),
    'admin'
  )
  OR public.has_role(
    auth.uid(),
    'owner'
  )
);

-- =========================================================
-- Defence-in-depth for profile system fields
-- =========================================================

CREATE OR REPLACE FUNCTION
  public.protect_profile_system_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF (
    auth.role() = 'authenticated'
    AND (
      NEW.id IS DISTINCT
        FROM OLD.id

      OR NEW.status IS DISTINCT
        FROM OLD.status

      OR NEW.trust_score IS DISTINCT
        FROM OLD.trust_score

      OR NEW.created_at IS DISTINCT
        FROM OLD.created_at

      OR NEW.deleted_at IS DISTINCT
        FROM OLD.deleted_at
    )
  ) THEN
    RAISE EXCEPTION
      'protected_profile_field'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL
ON FUNCTION
  public.protect_profile_system_fields()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS
  a_protect_profile_system_fields
ON public.profiles;

CREATE TRIGGER
  a_protect_profile_system_fields
BEFORE UPDATE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION
  public.protect_profile_system_fields();

-- =========================================================
-- Initial UDI provisioning
-- =========================================================

CREATE OR REPLACE FUNCTION
  public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data
        ->> 'display_name',
      ''
    )
  )
  ON CONFLICT (id)
  DO NOTHING;

  INSERT INTO public.user_roles (
    user_id,
    role
  )
  VALUES (
    NEW.id,
    'member'
  )
  ON CONFLICT
  DO NOTHING;

  INSERT INTO public.udi (
    user_id,
    level,
    attributes
  )
  VALUES (
    NEW.id,
    'guest',
    '{}'::jsonb
  )
  ON CONFLICT (user_id)
  DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL
ON FUNCTION
  public.handle_new_user()
FROM PUBLIC, anon, authenticated;

-- Existing users receive the initial non-verified UDI row.
INSERT INTO public.udi (
  user_id,
  level,
  attributes
)
SELECT
  profiles.id,
  'guest',
  '{}'::jsonb
FROM public.profiles
  AS profiles
WHERE NOT EXISTS (
  SELECT 1
  FROM public.udi
  WHERE
    udi.user_id =
      profiles.id
)
ON CONFLICT (user_id)
DO NOTHING;

COMMIT;