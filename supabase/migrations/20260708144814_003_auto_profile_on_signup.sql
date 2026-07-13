-- Auto-create a profile row whenever a new auth user is created.
-- Runs as SECURITY DEFINER so it can write to profiles regardless of caller role.
-- search_path is locked to pg_catalog to prevent search_path hijacking.
-- EXECUTE is revoked from PUBLIC/anon/authenticated so the function can only
-- be invoked by the trigger, not directly via /rest/v1/rpc/.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $
BEGIN
  INSERT INTO public.profiles AS p (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'fan')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, p.full_name),
        role = COALESCE(EXCLUDED.role, p.role);
  RETURN NEW;
END;
$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Drop existing trigger if re-running, then create fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow the trigger function (security definer) to bypass RLS on profiles
GRANT INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
