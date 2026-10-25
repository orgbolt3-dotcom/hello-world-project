BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(8);

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'public-feed@example.invalid',
  '',
  now(),
  '{}',
  '{}'
);

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"b0000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

INSERT INTO public.flashes (
  id, author_id, title, body, area_label, status, expires_at
) VALUES
  (
    'b0000000-0000-4000-8000-000000000010',
    auth.uid(),
    'Visible maintenant',
    'Corps confidentiel',
    'Centre',
    'live',
    (extract(epoch FROM now() + interval '1 hour') * 1000)::bigint
  ),
  (
    'b0000000-0000-4000-8000-000000000011',
    auth.uid(),
    'Brouillon invisible',
    'Secret brouillon',
    'Centre',
    'draft',
    (extract(epoch FROM now() + interval '1 hour') * 1000)::bigint
  );

RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);

SELECT is(
  (SELECT count(*)::integer FROM public.list_public_flashes(50)),
  1,
  'anonymous visitor sees only live, unexpired Flash entries'
);
SELECT is(
  (SELECT title FROM public.list_public_flashes(50) LIMIT 1),
  'Visible maintenant',
  'public title is returned'
);
SELECT ok(
  has_function_privilege('anon', 'public.list_public_flashes(integer)', 'EXECUTE'),
  'anonymous role can execute the bounded projection'
);
SELECT ok(
  has_function_privilege('authenticated', 'public.list_public_flashes(integer)', 'EXECUTE'),
  'authenticated role can execute the bounded projection'
);
SELECT is(
  (SELECT count(*)::integer
   FROM information_schema.routines
   WHERE routine_schema = 'public'
     AND routine_name = 'list_public_flashes'
     AND security_type = 'DEFINER'),
  1,
  'projection is a controlled security-definer boundary'
);
SELECT is(
  (SELECT count(*)::integer
   FROM information_schema.parameters
   WHERE specific_schema = 'public'
     AND specific_name LIKE 'list_public_flashes%'
     AND parameter_name IN ('body', 'author_id', 'latitude', 'longitude')),
  0,
  'sensitive fields are absent from the result contract'
);
SELECT is(
  (SELECT count(*)::integer FROM public.list_public_flashes(0)),
  1,
  'limit is clamped to a safe minimum'
);
SELECT is(
  (SELECT count(*)::integer FROM public.list_public_flashes(500)),
  1,
  'limit is clamped to a safe maximum'
);

SELECT * FROM finish();
ROLLBACK;
