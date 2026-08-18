-- Vina for Nails cloud schema
-- Applied via Supabase MCP; kept in repo for reference

CREATE TABLE IF NOT EXISTS public.designs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('swatch', 'gallery')),
  name_en TEXT NOT NULL,
  name_ku TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.salon_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_pin TEXT NOT NULL DEFAULT '1234',
  location JSONB,
  phones JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
