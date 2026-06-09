-- Public entrepreneur stories submitted by clients and approved by admins.

CREATE TABLE IF NOT EXISTS entrepreneur_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_entrepreneur_stories_status ON entrepreneur_stories(status);
CREATE INDEX IF NOT EXISTS idx_entrepreneur_stories_client_id ON entrepreneur_stories(client_id);
CREATE INDEX IF NOT EXISTS idx_entrepreneur_stories_created_at ON entrepreneur_stories(created_at DESC);

ALTER TABLE entrepreneur_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Historias aprobadas son publicas" ON entrepreneur_stories;
CREATE POLICY "Historias aprobadas son publicas"
  ON entrepreneur_stories FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Historias pueden ser consultadas por la app" ON entrepreneur_stories;
CREATE POLICY "Historias pueden ser consultadas por la app"
  ON entrepreneur_stories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Clientes pueden crear historias pendientes" ON entrepreneur_stories;
CREATE POLICY "Clientes pueden crear historias pendientes"
  ON entrepreneur_stories FOR INSERT
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Admins pueden revisar historias" ON entrepreneur_stories;
CREATE POLICY "Admins pueden revisar historias"
  ON entrepreneur_stories FOR UPDATE
  USING (true)
  WITH CHECK (status IN ('pending', 'approved', 'rejected'));

DROP POLICY IF EXISTS "Admins pueden eliminar historias" ON entrepreneur_stories;
CREATE POLICY "Admins pueden eliminar historias"
  ON entrepreneur_stories FOR DELETE
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON entrepreneur_stories TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-media',
  'story-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Story media files are public" ON storage.objects;
CREATE POLICY "Story media files are public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-media');

DROP POLICY IF EXISTS "Story media files can be uploaded" ON storage.objects;
CREATE POLICY "Story media files can be uploaded"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-media');

DROP POLICY IF EXISTS "Story media files can be updated" ON storage.objects;
CREATE POLICY "Story media files can be updated"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'story-media')
  WITH CHECK (bucket_id = 'story-media');

DROP POLICY IF EXISTS "Story media files can be deleted" ON storage.objects;
CREATE POLICY "Story media files can be deleted"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'story-media');
