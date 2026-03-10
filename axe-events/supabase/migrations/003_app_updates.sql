-- 003_app_updates.sql
-- Multi-day locations, guests, contact phone, registration, schedule, organizer role

-- Events: new columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS day_locations JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS guests JSONB;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS schedule JSONB;

-- Profiles: organizer status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organizer_status TEXT DEFAULT NULL;
