-- Script de creación de tablas para Barsuarte Artesanías
-- Ejecutar esto en Supabase SQL Editor

-- 1. Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- 2. Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. Crear tabla de media de productos
CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  data_url TEXT NOT NULL,
  name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por producto
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);

-- 4. Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Habilitar Row Level Security (RLS)
-- Esto es importante para seguridad

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para clientes
DROP POLICY IF EXISTS "Clientes pueden ver su propio perfil" ON clients;
CREATE POLICY "Clientes pueden ver su propio perfil"
  ON clients FOR SELECT
  USING (true); -- Por ahora permitir lectura pública, ajusta según necesites

DROP POLICY IF EXISTS "Clientes pueden insertar cuentas" ON clients;
CREATE POLICY "Clientes pueden insertar cuentas"
  ON clients FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Clientes pueden actualizar su propio perfil" ON clients;
CREATE POLICY "Clientes pueden actualizar su propio perfil"
  ON clients FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Políticas de RLS para productos (lectura pública)
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

-- Políticas de RLS para product_media (lectura pública)
DROP POLICY IF EXISTS "Media pública" ON product_media;
CREATE POLICY "Media pública"
  ON product_media FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Media puede ser insertada" ON product_media;
CREATE POLICY "Media puede ser insertada"
  ON product_media FOR INSERT
  WITH CHECK (true);

-- Políticas de RLS para mensajes
DROP POLICY IF EXISTS "Clientes ven sus mensajes" ON messages;
CREATE POLICY "Clientes ven sus mensajes"
  ON messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Clientes insertan mensajes" ON messages;
CREATE POLICY "Clientes insertan mensajes"
  ON messages FOR INSERT
  WITH CHECK (true);
