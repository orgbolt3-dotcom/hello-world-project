-- Hybrid assistant: atomic quotas, privacy-preserving usage and reviewed or
-- diversity-gated knowledge promotion. Raw user prompts are never persisted.

CREATE TABLE public.ai_requests (
  request_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('fr', 'en')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  source TEXT CHECK (source IN ('promoted_cache', 'gateway')),
  input_chars INTEGER NOT NULL DEFAULT 0 CHECK (input_chars BETWEEN 0 AND 12000),
  output_chars INTEGER NOT NULL DEFAULT 0 CHECK (output_chars BETWEEN 0 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_requests_user_created
  ON public.ai_requests (user_id, created_at DESC);

ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_requests FROM anon, authenticated;
GRANT ALL ON public.ai_requests TO service_role;

CREATE TABLE public.ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_hash TEXT NOT NULL,
  normalized_question TEXT NOT NULL CHECK (char_length(normalized_question) BETWEEN 3 AND 500),
  answer TEXT NOT NULL CHECK (char_length(answer) BETWEEN 1 AND 2000),
  locale TEXT NOT NULL CHECK (locale IN ('fr', 'en')),
  category TEXT NOT NULL CHECK (category IN ('navigation', 'feature', 'account', 'safety', 'other')),
  prompt_version INTEGER NOT NULL DEFAULT 1 CHECK (prompt_version > 0),
  hit_count INTEGER NOT NULL DEFAULT 1 CHECK (hit_count > 0),
  distinct_user_count INTEGER NOT NULL DEFAULT 1 CHECK (distinct_user_count > 0),
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'promoted', 'rejected')),
  is_local BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_at TIMESTAMPTZ,
  UNIQUE (question_hash, locale, prompt_version)
);

CREATE TABLE public.ai_cache_hits (
  cache_id UUID NOT NULL REFERENCES public.ai_cache(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cache_id, user_id)
);

CREATE INDEX idx_ai_cache_promoted
  ON public.ai_cache (locale, prompt_version, status, updated_at DESC);

ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache_hits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.ai_cache FROM anon, authenticated;
REVOKE ALL ON public.ai_cache_hits FROM anon, authenticated;
GRANT SELECT ON public.ai_cache TO authenticated;
GRANT ALL ON public.ai_cache, public.ai_cache_hits TO service_role;

CREATE POLICY "members read promoted assistant knowledge"
  ON public.ai_cache FOR SELECT TO authenticated
  USING (status = 'promoted' AND is_local = true);

CREATE OR REPLACE FUNCTION public.claim_assistant_request(
  p_request_id UUID,
  p_locale TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_existing TEXT;
  v_minute_count INTEGER;
  v_day_count INTEGER;
BEGIN
  IF v_user IS NULL OR p_locale NOT IN ('fr', 'en') THEN
    RETURN jsonb_build_object('decision', 'denied');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  SELECT status INTO v_existing
  FROM public.ai_requests
  WHERE request_id = p_request_id AND user_id = v_user;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('decision', 'duplicate', 'status', v_existing);
  END IF;

  SELECT count(*) INTO v_minute_count
  FROM public.ai_requests
  WHERE user_id = v_user AND created_at >= now() - interval '1 minute';
  IF v_minute_count >= 6 THEN
    RETURN jsonb_build_object('decision', 'rate_limited');
  END IF;

  SELECT count(*) INTO v_day_count
  FROM public.ai_requests
  WHERE user_id = v_user AND created_at >= now() - interval '24 hours';
  IF v_day_count >= 40 THEN
    RETURN jsonb_build_object('decision', 'daily_limit');
  END IF;

  INSERT INTO public.ai_requests (request_id, user_id, locale)
  VALUES (p_request_id, v_user, p_locale);
  RETURN jsonb_build_object('decision', 'allowed');
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_assistant_request(
  p_request_id UUID,
  p_source TEXT,
  p_input_chars INTEGER,
  p_output_chars INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR p_source NOT IN ('promoted_cache', 'gateway') THEN
    RETURN false;
  END IF;
  UPDATE public.ai_requests
  SET status = 'completed', source = p_source,
      input_chars = LEAST(GREATEST(p_input_chars, 0), 12000),
      output_chars = LEAST(GREATEST(p_output_chars, 0), 4000),
      completed_at = now()
  WHERE request_id = p_request_id AND user_id = auth.uid() AND status = 'pending';
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_assistant_request(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_requests
  SET status = 'failed', completed_at = now()
  WHERE request_id = p_request_id AND user_id = auth.uid() AND status = 'pending';
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_ai_cache_candidate(
  p_user_id UUID,
  p_question_hash TEXT,
  p_normalized_question TEXT,
  p_answer TEXT,
  p_locale TEXT,
  p_category TEXT,
  p_prompt_version INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cache_id UUID;
  v_distinct INTEGER;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role_required' USING ERRCODE = '42501';
  END IF;
  IF p_locale NOT IN ('fr', 'en') OR p_category NOT IN ('navigation', 'feature', 'account', 'safety', 'other')
     OR char_length(p_question_hash) <> 64 OR char_length(p_normalized_question) NOT BETWEEN 3 AND 500
     OR char_length(p_answer) NOT BETWEEN 1 AND 2000 OR p_prompt_version < 1 THEN
    RAISE EXCEPTION 'invalid_cache_candidate' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.ai_cache (
    question_hash, normalized_question, answer, locale, category, prompt_version
  ) VALUES (
    p_question_hash, p_normalized_question, p_answer, p_locale, p_category, p_prompt_version
  )
  ON CONFLICT (question_hash, locale, prompt_version) DO UPDATE
    SET hit_count = public.ai_cache.hit_count + 1, updated_at = now()
  RETURNING id INTO v_cache_id;

  INSERT INTO public.ai_cache_hits (cache_id, user_id)
  VALUES (v_cache_id, p_user_id)
  ON CONFLICT DO NOTHING;

  SELECT count(*) INTO v_distinct
  FROM public.ai_cache_hits WHERE cache_id = v_cache_id;

  UPDATE public.ai_cache
  SET distinct_user_count = v_distinct,
      status = CASE WHEN v_distinct >= 3 THEN 'promoted' ELSE status END,
      is_local = CASE WHEN v_distinct >= 3 THEN true ELSE is_local END,
      promoted_at = CASE WHEN v_distinct >= 3 THEN COALESCE(promoted_at, now()) ELSE promoted_at END,
      updated_at = now()
  WHERE id = v_cache_id AND status <> 'rejected';

  RETURN v_cache_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_assistant_request(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_assistant_request(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_assistant_request(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_ai_cache_candidate(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_assistant_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_assistant_request(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fail_assistant_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_ai_cache_candidate(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) TO service_role;
