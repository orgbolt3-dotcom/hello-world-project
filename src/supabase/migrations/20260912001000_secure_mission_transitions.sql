
## 8. Nouvelle migration Supabase

`supabase/migrations/20260912001000_secure_mission_transitions.sql`

```sql
BEGIN;

-- =========================================================
-- Legacy normalisation
-- =========================================================

UPDATE public.missions
SET status = 'completed'
WHERE status = 'done';

UPDATE public.missions
SET status = 'cancelled'
WHERE status NOT IN (
  'open',
  'assigned',
  'in_progress',
  'pending_validation',
  'completed',
  'disputed',
  'cancelled'
);

UPDATE public.missions
SET reward_amount = 0
WHERE reward_amount < 0;

UPDATE public.missions
SET reward_currency = 'XAF'
WHERE reward_currency <> 'XAF';

-- =========================================================
-- Mission constraints
-- =========================================================

ALTER TABLE public.missions
  DROP CONSTRAINT IF EXISTS
    missions_status_check,
  DROP CONSTRAINT IF EXISTS
    missions_reward_amount_check,
  DROP CONSTRAINT IF EXISTS
    missions_reward_currency_check,
  DROP CONSTRAINT IF EXISTS
    missions_title_length_check,
  DROP CONSTRAINT IF EXISTS
    missions_brief_length_check,

  ADD CONSTRAINT
    missions_status_check
    CHECK (
      status IN (
        'open',
        'assigned',
        'in_progress',
        'pending_validation',
        'completed',
        'disputed',
        'cancelled'
      )
    ),

  ADD CONSTRAINT
    missions_reward_amount_check
    CHECK (
      reward_amount >= 0
    ),

  ADD CONSTRAINT
    missions_reward_currency_check
    CHECK (
      reward_currency = 'XAF'
    ),

  ADD CONSTRAINT
    missions_title_length_check
    CHECK (
      char_length(
        btrim(title)
      ) BETWEEN 1 AND 160
    )
    NOT VALID,

  ADD CONSTRAINT
    missions_brief_length_check
    CHECK (
      char_length(
        btrim(brief)
      ) BETWEEN 1 AND 4000
    )
    NOT VALID;

-- =========================================================
-- Privileges and RLS
-- =========================================================

REVOKE DELETE, UPDATE
ON public.missions
FROM authenticated;

GRANT UPDATE (
  title,
  brief,
  status,
  assignee_id,
  reward_amount,
  reward_currency,
  due_at,
  deleted_at
)
ON public.missions
TO authenticated;

DROP POLICY IF EXISTS
  "own missions write"
ON public.missions;

DROP POLICY IF EXISTS
  "assignee advances mission"
ON public.missions;

CREATE POLICY
  "mission author creates"
ON public.missions
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
);

CREATE POLICY
  "mission participants update"
ON public.missions
FOR UPDATE
TO authenticated
USING (
  author_id = auth.uid()
  OR assignee_id = auth.uid()
)
WITH CHECK (true);

-- =========================================================
-- Authoritative mission state machine
-- =========================================================

CREATE OR REPLACE FUNCTION
  public.protect_mission_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  actor UUID := auth.uid();
  is_author BOOLEAN;
  is_assignee BOOLEAN;
  details_unchanged BOOLEAN;
BEGIN
  /*
   * Service-role and direct administrative database operations are handled
   * by trusted backend code. The trigger protects authenticated clients.
   */
  IF auth.role()
    IS DISTINCT FROM
      'authenticated'
  THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF
      actor IS NULL

      OR NEW.author_id
        IS DISTINCT FROM actor

      OR NEW.assignee_id
        IS NOT NULL

      OR NEW.status <> 'open'

      OR NEW.deleted_at
        IS NOT NULL
    THEN
      RAISE EXCEPTION
        'invalid_mission_creation'
        USING ERRCODE = '42501';
    END IF;

    NEW.created_at :=
      (
        EXTRACT(
          EPOCH FROM
            clock_timestamp()
        ) * 1000
      )::BIGINT;

    RETURN NEW;
  END IF;

  is_author :=
    OLD.author_id = actor;

  is_assignee :=
    OLD.assignee_id = actor;

  IF
    NEW.id
      IS DISTINCT FROM OLD.id

    OR NEW.author_id
      IS DISTINCT FROM
        OLD.author_id

    OR NEW.created_at
      IS DISTINCT FROM
        OLD.created_at
  THEN
    RAISE EXCEPTION
      'immutable_mission_field'
      USING ERRCODE = '42501';
  END IF;

  details_unchanged :=
    NEW.title
      IS NOT DISTINCT FROM
        OLD.title

    AND NEW.brief
      IS NOT DISTINCT FROM
        OLD.brief

    AND NEW.reward_amount
      IS NOT DISTINCT FROM
        OLD.reward_amount

    AND NEW.reward_currency
      IS NOT DISTINCT FROM
        OLD.reward_currency

    AND NEW.due_at
      IS NOT DISTINCT FROM
        OLD.due_at;

  -- Soft deletion: author, open state and no assignee only.
  IF NEW.deleted_at
    IS DISTINCT FROM
      OLD.deleted_at
  THEN
    IF NOT (
      is_author
      AND OLD.status = 'open'
      AND OLD.assignee_id IS NULL
      AND NEW.status = OLD.status
      AND details_unchanged
    ) THEN
      RAISE EXCEPTION
        'mission_deletion_not_allowed'
        USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
  END IF;

  -- Details may only change before assignment.
  IF NEW.status = OLD.status THEN
    IF NOT (
      is_author
      AND OLD.status = 'open'
      AND OLD.assignee_id IS NULL
      AND NEW.assignee_id IS NULL
    ) THEN
      RAISE EXCEPTION
        'mission_edit_not_allowed'
        USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
  END IF;

  -- A transition cannot also alter title, brief, reward or due date.
  IF NOT details_unchanged THEN
    RAISE EXCEPTION
      'mission_details_locked_during_transition'
      USING ERRCODE = '42501';
  END IF;

  -- open → assigned
  IF
    OLD.status = 'open'
    AND NEW.status = 'assigned'
  THEN
    IF NOT (
      is_author
      AND OLD.assignee_id IS NULL
      AND NEW.assignee_id IS NOT NULL
      AND NEW.assignee_id <>
        OLD.author_id
    ) THEN
      RAISE EXCEPTION
        'mission_assignment_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  -- assigned → open
  ELSIF
    OLD.status = 'assigned'
    AND NEW.status = 'open'
  THEN
    IF NOT (
      is_assignee
      AND NEW.assignee_id IS NULL
    ) THEN
      RAISE EXCEPTION
        'mission_decline_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  -- assigned → in_progress
  ELSIF
    OLD.status = 'assigned'
    AND NEW.status =
      'in_progress'
  THEN
    IF NOT (
      is_assignee
      AND NEW.assignee_id
        IS NOT DISTINCT FROM
          OLD.assignee_id
    ) THEN
      RAISE EXCEPTION
        'mission_start_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  -- assigned → cancelled
  ELSIF
    OLD.status = 'assigned'
    AND NEW.status =
      'cancelled'
  THEN
    IF NOT (
      is_author
      AND NEW.assignee_id
        IS NOT DISTINCT FROM
          OLD.assignee_id
    ) THEN
      RAISE EXCEPTION
        'mission_cancel_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  -- open → cancelled
  ELSIF
    OLD.status = 'open'
    AND NEW.status =
      'cancelled'
  THEN
    IF NOT (
      is_author
      AND NEW.assignee_id
        IS NULL
    ) THEN
      RAISE EXCEPTION
        'mission_cancel_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  -- in_progress → pending_validation
  ELSIF
    OLD.status =
      'in_progress'

    AND NEW.status =
      'pending_validation'
  THEN
    IF NOT (
      is_assignee
      AND NEW.assignee_id
        IS NOT DISTINCT FROM
          OLD.assignee_id
    ) THEN
      RAISE EXCEPTION
        'mission_submission_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  -- pending_validation → completed
  ELSIF
    OLD.status =
      'pending_validation'

    AND NEW.status =
      'completed'
  THEN
    IF NOT (
      is_author
      AND NEW.assignee_id
        IS NOT DISTINCT FROM
          OLD.assignee_id
    ) THEN
      RAISE EXCEPTION
        'mission_validation_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  -- Active mission → disputed
  ELSIF
    OLD.status IN (
      'in_progress',
      'pending_validation'
    )

    AND NEW.status =
      'disputed'
  THEN
    IF NOT (
      (
        is_author
        OR is_assignee
      )

      AND NEW.assignee_id
        IS NOT DISTINCT FROM
          OLD.assignee_id
    ) THEN
      RAISE EXCEPTION
        'mission_dispute_not_allowed'
        USING ERRCODE = '42501';
    END IF;

  ELSE
    RAISE EXCEPTION
      'invalid_mission_transition'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL
ON FUNCTION
  public.protect_mission_transition()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS
  a_protect_mission_transition
ON public.missions;

CREATE TRIGGER
  a_protect_mission_transition
BEFORE INSERT OR UPDATE
ON public.missions
FOR EACH ROW
EXECUTE FUNCTION
  public.protect_mission_transition();

-- =========================================================
-- Transition audit
-- =========================================================

CREATE OR REPLACE FUNCTION
  public.audit_mission_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status
    IS DISTINCT FROM
      OLD.status
  THEN
    INSERT INTO public.audit (
      actor_id,
      action,
      target_table,
      target_id,
      summary
    )
    VALUES (
      auth.uid(),

      'mission.transition.'
        || OLD.status
        || '.'
        || NEW.status,

      'missions',
      NEW.id,

      'Mission status changed from '
        || OLD.status
        || ' to '
        || NEW.status
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL
ON FUNCTION
  public.audit_mission_transition()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS
  z_audit_mission_transition
ON public.missions;

CREATE TRIGGER
  z_audit_mission_transition
AFTER UPDATE
ON public.missions
FOR EACH ROW
EXECUTE FUNCTION
  public.audit_mission_transition();

-- =========================================================
-- Query indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS
  idx_missions_author_status
ON public.missions (
  author_id,
  status
)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS
  idx_missions_assignee_status
ON public.missions (
  assignee_id,
  status
)
WHERE
  deleted_at IS NULL
  AND assignee_id IS NOT NULL;

COMMIT;