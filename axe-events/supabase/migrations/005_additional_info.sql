-- Add additional_info column for event-specific extra information
ALTER TABLE events ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Create storage bucket for event posters
-- NOTE: Run this in the Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public) VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload posters
CREATE POLICY "Authenticated users can upload posters"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-posters');

-- Allow public to read posters
CREATE POLICY "Public can read posters"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'event-posters');

-- Allow users to delete their own posters
CREATE POLICY "Users can delete own posters"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-posters' AND (storage.foldername(name))[1] = 'posters' AND (storage.foldername(name))[2] = auth.uid()::text);
