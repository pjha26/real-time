-- Run this in your Supabase SQL Editor to create the missing session_notes table

CREATE TABLE IF NOT EXISTS session_notes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  summary     TEXT NOT NULL,
  generated_by TEXT DEFAULT 'gemini-2.0-flash',
  is_mock     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for session_notes (Optional, but recommended)
-- ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Clients and experts can view their relevant notes"
--   ON session_notes FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM bookings b
--       LEFT JOIN experts e ON b.expert_id = e.id
--       WHERE b.id = session_notes.booking_id
--       AND (b.client_id = auth.uid() OR e.user_id = auth.uid())
--     )
--   );

-- ==========================================
-- Priority 5: Reviews and Audit Log Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id  UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  expert_id   UUID REFERENCES experts(id) ON DELETE CASCADE NOT NULL,
  client_id   UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating      INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Audit log for platform activity tracking
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(255) NOT NULL, -- e.g., 'booking_completed', 'note_generated'
  entity_type VARCHAR(50), -- e.g., 'booking', 'session_note'
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Priority 6: Row Level Security (RLS) Basics
-- ==========================================
-- To fully secure the backend (crucial before going live):
--
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only view their own bookings" ON bookings 
--    FOR SELECT USING (client_id = auth.uid() OR expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid()));

-- ==========================================
-- Expert Availability & Timezone Support
-- ==========================================

-- Add timezone, buffer time, and blocked dates to experts table
ALTER TABLE experts ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';
ALTER TABLE experts ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 0;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS blocked_dates DATE[] DEFAULT '{}';

-- Weekly working hours per expert (e.g. Mon 9:00–17:00)
CREATE TABLE IF NOT EXISTS expert_availability (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id   UUID REFERENCES experts(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),  -- 0=Sun, 1=Mon ... 6=Sat
  start_hour  TIME NOT NULL DEFAULT '09:00',
  end_hour    TIME NOT NULL DEFAULT '17:00',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(expert_id, day_of_week)
);
