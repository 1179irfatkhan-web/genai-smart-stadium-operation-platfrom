-- Create rate limits tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_request_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Define Policies: allow select/insert/update but no delete to prevent evasion
DROP POLICY IF EXISTS "users_read_own_rate_limits" ON rate_limits;
CREATE POLICY "users_read_own_rate_limits" ON rate_limits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_write_own_rate_limits" ON rate_limits;
CREATE POLICY "users_write_own_rate_limits" ON rate_limits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_rate_limits" ON rate_limits;
CREATE POLICY "users_update_own_rate_limits" ON rate_limits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create performance index
CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON rate_limits(user_id);
