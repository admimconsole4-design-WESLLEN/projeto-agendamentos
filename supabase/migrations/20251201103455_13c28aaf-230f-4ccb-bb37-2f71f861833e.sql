-- Limpar qualquer usuário problemático que possa ter sido criado incorretamente
-- Isso vai limpar roles de usuários que não existem mais no auth.users
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Garantir que a função make_user_admin está correta
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
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
    RAISE EXCEPTION 'Usuário com email % não encontrado. Crie a conta primeiro via signup na interface /auth', user_email;
  END IF;
  
  -- Inserir role de admin (evita duplicatas com ON CONFLICT)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Usuário % promovido a admin com sucesso!', user_email;
END;
$$;