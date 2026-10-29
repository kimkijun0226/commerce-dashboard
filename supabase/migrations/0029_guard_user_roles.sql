-- A member may edit their profile, but cannot grant themselves administrator access.
CREATE OR REPLACE FUNCTION public.guard_user_role() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF (TG_OP='INSERT' AND NEW.role='admin') OR (TG_OP='UPDATE' AND NEW.role IS DISTINCT FROM OLD.role) THEN
    IF current_user NOT IN ('postgres','supabase_admin') AND coalesce(auth.role(),'') <> 'service_role' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Administrator required for role changes' USING ERRCODE='42501';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS users_guard_role ON public.users;
CREATE TRIGGER users_guard_role BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.guard_user_role();
