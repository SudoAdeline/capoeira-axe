-- Allow authenticated users to claim community-shared events
CREATE POLICY "Users can claim community events"
  ON events FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND is_organizer = false
    AND (claim_status IS NULL OR claim_status = 'pending')
  )
  WITH CHECK (
    claimed_by = auth.uid()
    AND claim_status = 'pending'
  );
