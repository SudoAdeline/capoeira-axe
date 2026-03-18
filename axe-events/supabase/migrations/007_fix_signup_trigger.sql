-- Fix: update handle_new_user trigger to save all signup fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, apelido, capoeira_group, organizer_status, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'apelido', NULL),
    COALESCE(NEW.raw_user_meta_data->>'capoeira_group', NULL),
    CASE WHEN (NEW.raw_user_meta_data->>'is_organizer')::boolean = true THEN 'pending' ELSE NULL END,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    apelido = COALESCE(EXCLUDED.apelido, profiles.apelido),
    capoeira_group = COALESCE(EXCLUDED.capoeira_group, profiles.capoeira_group),
    organizer_status = COALESCE(EXCLUDED.organizer_status, profiles.organizer_status);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
