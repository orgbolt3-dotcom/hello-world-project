begin;

select plan(40);

-- The test runner is a database owner/superuser. Create two real auth users
-- first, then execute the assertions as the authenticated role.
insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'rls-a@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'rls-b@example.test', now(), now());

insert into public.profiles (id, display_name)
values
  ('00000000-0000-0000-0000-000000000001', 'RLS A'),
  ('00000000-0000-0000-0000-000000000002', 'RLS B')
on conflict (id) do update
set display_name = excluded.display_name;

insert into public.udi (user_id, level)
values
  ('00000000-0000-0000-0000-000000000001', 'verified'),
  ('00000000-0000-0000-0000-000000000002', 'guest');

insert into public.media (owner_id, kind)
values
  ('00000000-0000-0000-0000-000000000001', 'image'),
  ('00000000-0000-0000-0000-000000000002', 'image');

insert into public.flashes (id, author_id, title, body, status)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'A public', 'public', 'published'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'A draft', 'draft', 'draft');

insert into public.missions (id, author_id, assignee_id, title, brief, status)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Assigned', 'brief', 'open'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', null, 'Unassigned', 'brief', 'open');

insert into public.posts (id, author_id, body, visibility)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'public A', 'public'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'private A', 'private');

insert into public.notifications (id, recipient_id, title_key, body_key)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'a', 'a'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'b', 'b');

insert into public.audit (id, actor_id, action, target_table, summary)
values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'test', 'profiles', 'test');

-- Structural guarantees.
select has_table('public', 'user_roles', 'user_roles exists');
select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'udi', 'udi exists');
select has_table('public', 'media', 'media exists');
select has_table('public', 'flashes', 'flashes exists');
select has_table('public', 'missions', 'missions exists');
select has_table('public', 'posts', 'posts exists');
select has_table('public', 'notifications', 'notifications exists');
select has_table('public', 'audit', 'audit exists');

select ok(
  (
    select count(*) = 9
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'user_roles', 'profiles', 'udi', 'media',
        'flashes', 'missions', 'posts', 'notifications', 'audit'
      )
      and c.relrowsecurity
  ),
  'all sync tables have RLS enabled'
);

select policies_are(
  'public', 'user_roles',
  array['own roles are readable', 'owners manage roles']
);
select policies_are(
  'public', 'profiles',
  array['profiles readable by members', 'own profile insert', 'own profile update']
);
select policies_are(
  'public', 'udi',
  array['own identity readable', 'own identity insert', 'own identity update']
);
select policies_are(
  'public', 'media',
  array['media readable by members', 'own media write']
);
select policies_are(
  'public', 'flashes',
  array['flashes readable by members', 'own flashes write', 'moderators moderate flashes']
);
select policies_are(
  'public', 'missions',
  array['missions readable by members', 'own missions write', 'assignee advances mission']
);
select policies_are(
  'public', 'posts',
  array['posts readable by members', 'own posts write']
);
select policies_are(
  'public', 'notifications',
  array['own notifications readable', 'own notifications update']
);
select policies_are(
  'public', 'audit',
  array['audit readable by admins']
);

-- User A: positive access and ownership boundaries.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*) from public.user_roles where user_id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'user A can read own role'
);
select is(
  (select count(*) from public.user_roles where user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'user A cannot read user B role'
);
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-000000000001'),
  'RLS A',
  'user A can read own profile'
);
select is(
  (select count(*) from public.udi where user_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'user A cannot read user B identity'
);
select is(
  (select count(*) from public.media where owner_id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'user A can read own media'
);
select is(
  (select count(*) from public.flashes where author_id = '00000000-0000-0000-0000-000000000001' and status = 'published'),
  1::bigint,
  'user A can read own published flash'
);
select is(
  (select count(*) from public.posts where id = '30000000-0000-0000-0000-000000000002'),
  1::bigint,
  'user A can read own private post'
);
select is(
  (select count(*) from public.notifications where recipient_id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'user A can read own notification'
);

-- User B: shared/public access, private isolation, and assignee capability.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'user B can read a member profile'
);
select is(
  (select count(*) from public.media where owner_id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'user B can read member media'
);
select is(
  (select count(*) from public.flashes where id = '10000000-0000-0000-0000-000000000001'),
  1::bigint,
  'user B can read a published flash'
);
select is(
  (select count(*) from public.flashes where id = '10000000-0000-0000-0000-000000000002'),
  0::bigint,
  'user B cannot read another users draft flash'
);
select is(
  (select count(*) from public.posts where id = '30000000-0000-0000-0000-000000000001'),
  1::bigint,
  'user B can read a public post'
);
select is(
  (select count(*) from public.posts where id = '30000000-0000-0000-0000-000000000002'),
  0::bigint,
  'user B cannot read another users private post'
);
select is(
  (select count(*) from public.notifications where recipient_id = '00000000-0000-0000-0000-000000000001'),
  0::bigint,
  'user B cannot read user A notifications'
);
select is(
  (select count(*) from public.audit),
  0::bigint,
  'user B cannot read admin audit data'
);

-- User B must not update user A profile or identity.
update public.profiles
set display_name = 'ATTACKED'
where id = '00000000-0000-0000-0000-000000000001';
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-000000000001'),
  'RLS A',
  'user B cannot update user A profile'
);

update public.udi
set level = 'verified'
where user_id = '00000000-0000-0000-0000-000000000001';
reset role;
select is(
  (select level from public.udi where user_id = '00000000-0000-0000-0000-000000000001'),
  'verified',
  'user B cannot change user A identity'
);
set local role authenticated;

-- Assignee B is allowed to advance A's mission, but cannot edit an unassigned mission.
update public.missions
set status = 'in_progress'
where id = '20000000-0000-0000-0000-000000000001';
select is(
  (select status from public.missions where id = '20000000-0000-0000-0000-000000000001'),
  'in_progress',
  'assignee B can advance assigned mission'
);

update public.missions
set status = 'in_progress'
where id = '20000000-0000-0000-0000-000000000002';
select is(
  (select status from public.missions where id = '20000000-0000-0000-0000-000000000002'),
  'open',
  'assignee B cannot update unassigned mission'
);

-- A member cannot grant itself a role.
select throws_ok(
  'insert into public.user_roles (user_id, role) values (''00000000-0000-0000-0000-000000000002'', ''admin'')',
  '42501',
  'new row violates row-level security policy for table "user_roles"',
  'member cannot self-grant admin role'
);

select * from finish();
rollback;
