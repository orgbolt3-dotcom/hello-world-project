BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT plan(10);

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'radar-a@example.invalid', '', now(), '{}', '{}'),
  ('c0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'radar-b@example.invalid', '', now(), '{}', '{}');

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"c0000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

SELECT lives_ok($$
  INSERT INTO public.radars (
    id, owner_id, title, query, area_label, radius_km, starts_at, expires_at
  ) VALUES (
    'c0000000-0000-4000-8000-000000000010',
    auth.uid(),
    'Trouver un répétiteur',
    'Je cherche un répétiteur de mathématiques',
    'Centre',
    10,
    (extract(epoch FROM now()) * 1000)::bigint,
    (extract(epoch FROM now() + interval '10 days') * 1000)::bigint
  )
$$, 'owner creates a private Radar draft');

SELECT is(
  (SELECT status FROM public.radars WHERE id = 'c0000000-0000-4000-8000-000000000010'),
  'draft',
  'new Radar remains a draft'
);

SELECT throws_ok(
  $$UPDATE public.radars SET status = 'active' WHERE id = 'c0000000-0000-4000-8000-000000000010'$$,
  '42501',
  'permission denied for table radars',
  'direct status mutation is forbidden'
);

SELECT lives_ok(
  $$SELECT public.command_radar('c0000000-0000-4000-8000-000000000010', 'activate')$$,
  'owner activates Radar through the command'
);
SELECT is(
  (SELECT status FROM public.radars WHERE id = 'c0000000-0000-4000-8000-000000000010'),
  'active',
  'activation changes the status'
);
SELECT ok(
  (SELECT next_review_at IS NOT NULL FROM public.radars WHERE id = 'c0000000-0000-4000-8000-000000000010'),
  'activation schedules weekly review'
);

SELECT set_config(
  'request.jwt.claims',
  '{"sub":"c0000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
SELECT is(
  (SELECT count(*)::integer FROM public.radars),
  0,
  'another member cannot read the Radar'
);
SELECT throws_ok(
  $$SELECT public.command_radar('c0000000-0000-4000-8000-000000000010', 'pause')$$,
  '42501',
  'radar_not_found',
  'another member cannot command the Radar'
);
SELECT is(
  has_function_privilege('anon', 'public.command_radar(uuid,text)', 'EXECUTE'),
  false,
  'anonymous visitors cannot command Radar'
);

SELECT set_config(
  'request.jwt.claims',
  '{"sub":"c0000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
SELECT throws_ok($$
  INSERT INTO public.radars (
    owner_id, title, query, area_label, starts_at, expires_at
  ) VALUES (
    auth.uid(),
    'Durée invalide',
    'Cette veille est beaucoup trop courte',
    'Centre',
    (extract(epoch FROM now()) * 1000)::bigint,
    (extract(epoch FROM now() + interval '2 days') * 1000)::bigint
  )
$$, '23514', 'new row for relation "radars" violates check constraint "radars_duration"', 'duration below three days is rejected');

SELECT * FROM finish();
ROLLBACK;
