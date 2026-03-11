-- Add ownership fields to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_organizer BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS shared_by_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES profiles(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS claim_status TEXT CHECK (claim_status IN ('pending', 'approved', 'rejected'));
