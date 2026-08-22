-- Rollback: 008_create_phase1_member_experience.down.sql
DROP FUNCTION IF EXISTS public.get_member_entitlement_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.claim_founder_spot(UUID, TEXT) CASCADE;
DROP TABLE IF EXISTS public.user_saved_reports CASCADE;
DROP TABLE IF EXISTS public.vault_folders CASCADE;
DROP TABLE IF EXISTS public.member_gamer_profiles CASCADE;
DROP TABLE IF EXISTS public.founder_allocations CASCADE;
DROP TABLE IF EXISTS public.member_entitlements CASCADE;
