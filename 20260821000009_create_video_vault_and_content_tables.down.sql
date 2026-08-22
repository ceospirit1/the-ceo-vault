-- Down Migration 009: Drop Video Vault & Progress Tables
DROP TABLE IF EXISTS public.user_video_progress CASCADE;
DROP TABLE IF EXISTS public.video_vault CASCADE;
