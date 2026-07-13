-- Security hardening for handle_new_user trigger function:
-- 1. Lock search_path to pg_catalog so it can't be hijacked via mutable search_path.
-- 2. Revoke EXECUTE from anon/authenticated so the SECURITY DEFINER function
--    cannot be invoked directly via /rest/v1/rpc/handle_new_user.
--    Trigger functions fire without needing EXECUTE permission, so this is safe.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
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
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
