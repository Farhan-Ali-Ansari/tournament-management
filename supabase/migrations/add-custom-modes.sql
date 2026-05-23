-- Run in Supabase SQL Editor if your tournaments table already exists.
-- Same content as supabase/FIX-CUSTOM-MODES.sql

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'tournaments'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%mode%'
  LOOP
    EXECUTE format('ALTER TABLE public.tournaments DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.tournaments
  ADD CONSTRAINT tournaments_mode_check
  CHECK (mode IN ('league', 'knockout', 'custom_league', 'custom_knockout'));
