-- Ensure product CRUD and product media uploads work from the public app client.

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  data_url TEXT NOT NULL,
  name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Productos públicos" ON products;
CREATE POLICY "Productos públicos"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Productos pueden ser creados" ON products;
CREATE POLICY "Productos pueden ser creados"
  ON products FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Productos pueden ser actualizados" ON products;
CREATE POLICY "Productos pueden ser actualizados"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Productos pueden ser eliminados" ON products;
CREATE POLICY "Productos pueden ser eliminados"
  ON products FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Media pública" ON product_media;
CREATE POLICY "Media pública"
  ON product_media FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Media puede ser insertada" ON product_media;
CREATE POLICY "Media puede ser insertada"
  ON product_media FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Media puede ser actualizada" ON product_media;
CREATE POLICY "Media puede ser actualizada"
  ON product_media FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Media puede ser eliminada" ON product_media;
CREATE POLICY "Media puede ser eliminada"
  ON product_media FOR DELETE
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_media TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Product media files are public" ON storage.objects;
CREATE POLICY "Product media files are public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Product media files can be uploaded" ON storage.objects;
CREATE POLICY "Product media files can be uploaded"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Product media files can be updated" ON storage.objects;
CREATE POLICY "Product media files can be updated"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-media')
  WITH CHECK (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Product media files can be deleted" ON storage.objects;
CREATE POLICY "Product media files can be deleted"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-media');
