-- ============================================================
-- DEGRADATION WATCH - SUPABASE POSTGRESQL SCHEMA
-- Designed for Cloudflare + Supabase + Next.js
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'authority', 'patrol')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AUTHORITIES TABLE (County, Environmental Management, Municipal)
CREATE TABLE IF NOT EXISTS public.authorities (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    region TEXT NOT NULL,
    department TEXT DEFAULT 'Environment & Sanitation',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOCATIONS TABLE (Aggregated Degradation Spots)
CREATE TABLE IF NOT EXISTS public.locations (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'flagged', 'in_progress', 'resolved')),
    unique_reporters INTEGER DEFAULT 1,
    report_count INTEGER DEFAULT 1,
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    flagged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index coordinates for fast proximity queries
CREATE INDEX IF NOT EXISTS idx_locations_coords ON public.locations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_status ON public.locations (status);

-- 4. REPORTS TABLE (Individual Citizen Submissions)
CREATE TABLE IF NOT EXISTS public.reports (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT REFERENCES public.locations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    category TEXT DEFAULT 'Illegal Dumping',
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ai_analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports (location_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);

-- 5. NOTIFICATIONS LOG (Email & Textbee SMS Alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT REFERENCES public.locations(id) ON DELETE CASCADE,
    authority_id BIGINT REFERENCES public.authorities(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'failed')),
    external_message_id TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GPS PATROL & FIELD TRACKING
CREATE TABLE IF NOT EXISTS public.patrol_tracks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patrol_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    tracked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patrol_tracked_at ON public.patrol_tracks (tracked_at DESC);

-- 7. MPESA BOUNTIES & CLEANUP TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_reference TEXT UNIQUE NOT NULL,
    merchant_request_id TEXT,
    checkout_request_id TEXT,
    location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    purpose TEXT DEFAULT 'cleanup_bounty',
    mpesa_receipt_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    result_code INTEGER,
    result_desc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTOMATED FLAGGING TRIGGER (PostgreSQL)
-- When > 10 distinct users report a location, auto-flag it!
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_report_flagging()
RETURNS TRIGGER AS $$
DECLARE
    distinct_users INTEGER;
    total_reps INTEGER;
BEGIN
    -- Calculate distinct reporters and total reports for the location
    SELECT COUNT(DISTINCT reporter_name), COUNT(*)
    INTO distinct_users, total_reps
    FROM public.reports
    WHERE location_id = NEW.location_id;

    -- Update location statistics
    UPDATE public.locations
    SET 
        unique_reporters = distinct_users,
        report_count = total_reps,
        updated_at = NOW(),
        status = CASE 
            WHEN distinct_users > 10 AND status = 'open' THEN 'flagged' 
            ELSE status 
        END,
        flagged_at = CASE 
            WHEN distinct_users > 10 AND flagged_at IS NULL THEN NOW() 
            ELSE flagged_at 
        END
    WHERE id = NEW.location_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_report_flagging ON public.reports;
CREATE TRIGGER trigger_report_flagging
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_report_flagging();

-- ============================================================
-- SEED DATA FOR DEMO & HACKATHON
-- ============================================================
INSERT INTO public.authorities (name, email, phone, region, department)
VALUES 
('Machakos County Environment Office', 'environment@machakos.go.ke', '+254712345678', 'Machakos Central', 'Environment & Sanitation'),
('Nairobi City Sanitation Directorate', 'sanitation@nairobi.go.ke', '+254722998877', 'CBD & Westlands', 'Public Works & Waste Management'),
('Kiambu Rapid Cleanup Taskforce', 'rapidresponse@kiambu.go.ke', '+254733112233', 'Thika Sub-County', 'Rapid Response')
ON CONFLICT DO NOTHING;
