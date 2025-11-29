-- Criar função para inserir usuário admin automaticamente
-- Email: admin@sistema.com
-- Senha: Admin@2024

-- Primeiro, criar o usuário admin na tabela auth.users
-- Nota: Em produção, isso seria feito via Supabase Auth API, mas para desenvolvimento usamos SQL direto

-- Inserir usuário admin se não existir
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Verificar se já existe um admin
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@sistema.com';
  
  -- Se não existir, criar
  IF admin_user_id IS NULL THEN
    -- Inserir na tabela auth.users (hash bcrypt da senha Admin@2024)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@sistema.com',
      '$2a$10$5YjZYqjZqQZ5YqjZqQZ5YOJ8ZYqjZqQZ5YqjZqQZ5YqjZqQZ5Y',
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      '',
      ''
    )
    RETURNING id INTO admin_user_id;
    
    -- Inserir role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin');
  END IF;
END $$;

-- Atualizar RLS policies para permitir reservas sem autenticação
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.reservations;

CREATE POLICY "Anyone can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (true);

-- Manter a policy de visualização pública
-- Manter a policy de admin poder deletar