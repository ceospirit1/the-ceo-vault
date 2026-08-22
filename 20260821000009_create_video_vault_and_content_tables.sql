-- Migration 009: Video Vault, Masterclasses, and User Video Progress Tracking
-- Full RLS Security for VIP Masterclasses and Individual Progress Persistence

CREATE TABLE IF NOT EXISTS public.video_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    tag TEXT DEFAULT 'VIP EXCLUSIVE',
    description TEXT,
    views_count INTEGER DEFAULT 0,
    is_vip BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES public.video_vault(id) ON DELETE CASCADE NOT NULL,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    is_completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_video_progress UNIQUE (user_id, video_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_video_vault_category ON public.video_vault(category);
CREATE INDEX IF NOT EXISTS idx_user_video_progress_user ON public.user_video_progress(user_id);

-- Enable RLS
ALTER TABLE public.video_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;

-- Policies for video_vault
CREATE POLICY "Public read for published videos"
    ON public.video_vault FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admin manage video vault"
    ON public.video_vault FOR ALL
    USING (auth.is_admin());

-- Policies for user_video_progress
CREATE POLICY "User manage own video progress"
    ON public.user_video_progress FOR ALL
    USING (auth.uid() = user_id OR auth.is_admin());

-- Initial Seed Masterclasses
INSERT INTO public.video_vault (title, category, duration, video_url, tag, description, is_vip)
VALUES 
('Complete 2K27 Cap Breaker Guide: Best Build Allocations (THE CEO)', 'Masterclasses', '18:42', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'VIP EXCLUSIVE', 'In-depth breakdown of how cap breakers calculate attribute weight, and how to maximize badge unlocks without wasting VC.', true),
('Comp 5v5 Pro-Am Defensive Rotations & 6-1 Front Stunt (CEO SPIRIT)', 'Defensive Schemes', '14:15', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'VIP EXCLUSIVE', 'Masterclass on perimeter rotation rules, hash stunting, and communication protocols for elite Pro-Am squads.', true),
('Secret Jumpshot Cues: How to Green Every Shot with No Meter (CHOSENGREATNESS)', 'Jumpshot Secrets', '22:05', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'VIP EXCLUSIVE', 'Frame-by-frame visual breakdown of Push, Release, Set Point, and Jump cues on the top 10 competitive bases.', true),
('6''6" 2-Way Shot Creator Build Breakdown & Gameplay Showcase', 'Build Breakdowns', '16:30', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'VIP EXCLUSIVE', 'Live Stage and Rec gameplay breakdown showing badge triggers and iso scoring combos on this tier 1 build.', true)
ON CONFLICT DO NOTHING;
