-- 0012_users_phone.sql
-- Add phone to public.users and sync from auth.users metadata when available.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.users ADD COLUMN phone text;
  END IF;
END $$;

-- If the auth trigger function exists, enrich it to also write phone.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_auth_user'
  ) THEN
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $func$
      DECLARE
        display_name text;
        phone text;
      BEGIN
        display_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', '')), '');
        IF display_name IS NULL THEN
          display_name := split_part(COALESCE(NEW.email, ''), '@', 1);
        END IF;

        phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');

        INSERT INTO public.users (id, email, display_name, phone, role)
        VALUES (NEW.id, NEW.email, display_name, phone, 'user')
        ON CONFLICT (id) DO UPDATE
        SET
          email = EXCLUDED.email,
          display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
          phone = COALESCE(EXCLUDED.phone, public.users.phone),
          updated_at = now();

        RETURN NEW;
      END;
      $func$;
    $sql$;
  END IF;
END $$;

-- Backfill phone for existing profiles when auth.users is available.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'auth'
      AND table_name = 'users'
  ) THEN
    UPDATE public.users u
    SET phone = NULLIF(TRIM(au.raw_user_meta_data->>'phone'), '')
    FROM auth.users au
    WHERE au.id = u.id
      AND (u.phone IS NULL OR u.phone = '')
      AND NULLIF(TRIM(au.raw_user_meta_data->>'phone'), '') IS NOT NULL;
  END IF;
END $$;

