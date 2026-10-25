-- =========================================================
-- Ecosystem backend: raw data tables + RLS + sync revisions
-- =========================================================

CREATE SEQUENCE IF NOT EXISTS public.sync_revision_seq AS BIGINT;

CREATE OR REPLACE FUNCTION public.assign_sync_revision()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.revision := nextval('public.sync_revision_seq');
  NEW.server_updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------- roles ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('member', 'moderator', 'admin', 'owner');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "own roles are readable" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owners manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- ---------- profiles ----------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  handle TEXT UNIQUE,
  avatar_media_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  locale TEXT NOT NULL DEFAULT 'fr',
  trust_score INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles readable by members" ON public.profiles
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "own profile insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TRIGGER profiles_revision BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- udi (progressive identity) ----------
CREATE TABLE public.udi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'guest',
  verified_at BIGINT,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE ON public.udi TO authenticated;
GRANT ALL ON public.udi TO service_role;
ALTER TABLE public.udi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own identity readable" ON public.udi
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own identity insert" ON public.udi
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own identity update" ON public.udi
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER udi_revision BEFORE INSERT OR UPDATE ON public.udi
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

-- ---------- media ----------
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'image',
  state TEXT NOT NULL DEFAULT 'local',
  remote_path TEXT,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  byte_size BIGINT NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media readable by members" ON public.media
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "own media write" ON public.media
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE TRIGGER media_revision BEFORE INSERT OR UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

-- ---------- flashes ----------
CREATE TABLE public.flashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  expires_at BIGINT,
  media_ids UUID[] NOT NULL DEFAULT '{}',
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashes TO authenticated;
GRANT ALL ON public.flashes TO service_role;
ALTER TABLE public.flashes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flashes readable by members" ON public.flashes
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (status <> 'draft' OR author_id = auth.uid()));
CREATE POLICY "own flashes write" ON public.flashes
  FOR ALL TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "moderators moderate flashes" ON public.flashes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER flashes_revision BEFORE INSERT OR UPDATE ON public.flashes
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

-- ---------- missions ----------
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  brief TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  reward_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  reward_currency TEXT NOT NULL DEFAULT 'XAF',
  due_at BIGINT,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.missions TO authenticated;
GRANT ALL ON public.missions TO service_role;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "missions readable by members" ON public.missions
  FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "own missions write" ON public.missions
  FOR ALL TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "assignee advances mission" ON public.missions
  FOR UPDATE TO authenticated USING (assignee_id = auth.uid()) WITH CHECK (assignee_id = auth.uid());

CREATE TRIGGER missions_revision BEFORE INSERT OR UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

-- ---------- posts ----------
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public',
  media_ids UUID[] NOT NULL DEFAULT '{}',
  reaction_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts readable by members" ON public.posts
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (visibility <> 'private' OR author_id = auth.uid()));
CREATE POLICY "own posts write" ON public.posts
  FOR ALL TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE TRIGGER posts_revision BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

-- ---------- notifications ----------
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'in_app',
  title_key TEXT NOT NULL DEFAULT '',
  body_key TEXT NOT NULL DEFAULT '',
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at BIGINT,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own notifications readable" ON public.notifications
  FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "own notifications update" ON public.notifications
  FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

CREATE TRIGGER notifications_revision BEFORE INSERT OR UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

-- ---------- audit ----------
CREATE TABLE public.audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  summary TEXT NOT NULL DEFAULT '',
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  deleted_at BIGINT,
  revision BIGINT NOT NULL DEFAULT 0,
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit TO authenticated;
GRANT ALL ON public.audit TO service_role;
ALTER TABLE public.audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit readable by admins" ON public.audit
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE TRIGGER audit_revision BEFORE INSERT OR UPDATE ON public.audit
  FOR EACH ROW EXECUTE FUNCTION public.assign_sync_revision();

-- ---------- sync indexes ----------
CREATE INDEX idx_profiles_revision ON public.profiles (revision);
CREATE INDEX idx_udi_revision ON public.udi (revision);
CREATE INDEX idx_media_revision ON public.media (revision);
CREATE INDEX idx_flashes_revision ON public.flashes (revision);
CREATE INDEX idx_missions_revision ON public.missions (revision);
CREATE INDEX idx_posts_revision ON public.posts (revision);
CREATE INDEX idx_notifications_revision ON public.notifications (revision);
CREATE INDEX idx_audit_revision ON public.audit (revision);
