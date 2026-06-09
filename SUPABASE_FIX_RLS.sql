-- Correccion puntual para permitir registro de clientes y administradores.
-- Ejecutar en Supabase SQL Editor con permisos de owner.

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clientes pueden ver su propio perfil" ON clients;
CREATE POLICY "Clientes pueden ver su propio perfil"
  ON clients FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Clientes pueden insertar cuentas" ON clients;
CREATE POLICY "Clientes pueden insertar cuentas"
  ON clients FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Clientes pueden actualizar su propio perfil" ON clients;
CREATE POLICY "Clientes pueden actualizar su propio perfil"
  ON clients FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Clientes pueden eliminar cuentas" ON clients;
CREATE POLICY "Clientes pueden eliminar cuentas"
  ON clients FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Admins publicos" ON admins;
DROP POLICY IF EXISTS "Admins públicas" ON admins;
CREATE POLICY "Admins publicos"
  ON admins FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins pueden ser creados" ON admins;
CREATE POLICY "Admins pueden ser creados"
  ON admins FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins pueden ser eliminados" ON admins;
CREATE POLICY "Admins pueden ser eliminados"
  ON admins FOR DELETE
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON admins TO anon, authenticated;
