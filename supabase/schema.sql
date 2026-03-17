-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla Perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  config JSONB DEFAULT '{"meta_diaria": 10, "hora_inicio": "08:00", "hora_fin": "22:00", "modo_reduccion_activa": false, "precio_paquete": 5.00}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Logs (Cigarrillos consumidos)
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  es_emergencia BOOLEAN DEFAULT false,
  intervalo_recalculado INTEGER
);

-- RLS (Row Level Security) - Básicos
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON profiles;
CREATE POLICY "Usuarios pueden ver su propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios logs" ON logs;
CREATE POLICY "Usuarios pueden ver sus propios logs" ON logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios logs" ON logs;
CREATE POLICY "Usuarios pueden insertar sus propios logs" ON logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios logs" ON logs;
CREATE POLICY "Usuarios pueden eliminar sus propios logs" ON logs FOR DELETE USING (auth.uid() = user_id);

-- Función para manejar el registro de nuevos usuarios en public.profiles automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función handle_new_user al registrar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Tabla Suscripciones Push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias suscripciones" ON push_subscriptions;
CREATE POLICY "Usuarios pueden ver sus propias suscripciones" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propias suscripciones" ON push_subscriptions;
CREATE POLICY "Usuarios pueden insertar sus propias suscripciones" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias suscripciones" ON push_subscriptions;
CREATE POLICY "Usuarios pueden eliminar sus propias suscripciones" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);

