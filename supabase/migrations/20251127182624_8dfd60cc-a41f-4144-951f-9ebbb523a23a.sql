-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas admins podem ver roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  );
END;
$$;

-- Atualizar políticas de equipamentos para apenas admins
DROP POLICY IF EXISTS "Anyone can create equipments" ON public.equipments;
DROP POLICY IF EXISTS "Anyone can update equipments" ON public.equipments;
DROP POLICY IF EXISTS "Anyone can delete equipments" ON public.equipments;

CREATE POLICY "Only admins can create equipments" ON public.equipments
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update equipments" ON public.equipments
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete equipments" ON public.equipments
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Atualizar políticas de time_slots para apenas admins
DROP POLICY IF EXISTS "Anyone can create time slots" ON public.time_slots;
DROP POLICY IF EXISTS "Anyone can delete time slots" ON public.time_slots;

CREATE POLICY "Only admins can create time slots" ON public.time_slots
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete time slots" ON public.time_slots
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Políticas de reservas: qualquer um autenticado pode criar/deletar suas reservas
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can delete reservations" ON public.reservations;

CREATE POLICY "Authenticated users can create reservations" ON public.reservations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete any reservation" ON public.reservations
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Função para criar primeiro admin (será chamada manualmente após criar conta)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Inserir role de admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;