-- Create atomic check-and-update rate limiting function using row-locking FOR UPDATE
CREATE OR REPLACE FUNCTION check_and_update_rate_limit(
  p_user_id uuid,
  p_cooldown_interval interval
) RETURNS TABLE (
  allowed boolean,
  retry_after_ms double precision
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_last_request_at timestamptz;
  v_now timestamptz := now();
  v_elapsed interval;
BEGIN
  -- Ensure a row exists for the user first to make FOR UPDATE block concurrent transactions
  INSERT INTO rate_limits (user_id, last_request_at)
  VALUES (p_user_id, '1970-01-01 00:00:00+00')
  ON CONFLICT (user_id) DO NOTHING;

  -- Select for update to lock the row and prevent race conditions
  SELECT last_request_at INTO v_last_request_at
  FROM rate_limits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Ignore the initial dummy epoch time in calculation
  IF v_last_request_at IS NOT NULL AND v_last_request_at > '1970-01-02 00:00:00+00' THEN
    v_elapsed := v_now - v_last_request_at;
    IF v_elapsed < p_cooldown_interval THEN
      -- Rate limited: Return allowed=FALSE and retry after ms
      RETURN QUERY SELECT FALSE, EXTRACT(EPOCH FROM (p_cooldown_interval - v_elapsed)) * 1000;
      RETURN;
    END IF;
  END IF;

  -- Update to now
  UPDATE rate_limits
  SET last_request_at = v_now
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT TRUE, 0.0;
END;
$$;
