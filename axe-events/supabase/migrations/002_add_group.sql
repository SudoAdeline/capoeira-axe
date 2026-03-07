-- Add capoeira_group field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS capoeira_group TEXT;
