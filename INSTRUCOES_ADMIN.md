# 🔐 Configuração do Primeiro Administrador

## Passo a Passo para Criar Conta de Admin

### 1. Criar Conta
1. Acesse a aplicação
2. Clique em **"Entrar"** no topo da página
3. Vá para aba **"Criar Conta"**
4. Preencha:
   - Email: `admin@sistema.com` (ou seu email preferido)
   - Senha: Mínimo 6 caracteres
   - Confirmar senha
5. Clique em **"Criar Conta"**

### 2. Tornar a Conta Admin

Após criar a conta, você precisa promover o usuário para administrador usando o banco de dados.

#### Opção A: Usando Lovable Cloud Dashboard

1. Clique no botão abaixo para abrir o backend:

<lov-presentation-actions>
<lov-presentation-open-backend>Abrir Backend</lov-presentation-open-backend>
</lov-presentation-actions>

2. Vá até a aba **"Database"**
3. Clique em **"SQL Editor"** (ou equivalente)
4. Execute o comando SQL:

```sql
SELECT public.make_user_admin('admin@sistema.com');
```

Substitua `admin@sistema.com` pelo email que você usou no cadastro.

#### Opção B: SQL Direto no Supabase

Se você tiver acesso ao SQL Editor do Supabase, execute:

```sql
-- Substitua 'seu@email.com' pelo email cadastrado
SELECT public.make_user_admin('seu@email.com');
```

### 3. Fazer Login como Admin

1. Volte para aplicação
2. Faça login com o email e senha cadastrados
3. Agora você verá o botão **"Admin"** no topo da página
4. Clique nele para acessar o painel administrativo

## ✅ Verificação

Para confirmar que está funcionando:

1. Faça login com a conta
2. Você deve ver o botão "Admin" no topo
3. Ao clicar em "Admin", você acessa o painel
4. Consegue adicionar/remover equipamentos
5. Consegue configurar horários
6. Consegue ver e cancelar todas as reservas

## 🔒 Segurança

- **Apenas usuários marcados como admin** podem:
  - Acessar o painel `/admin`
  - Criar/editar/deletar equipamentos
  - Criar/deletar faixas horárias
  - Cancelar qualquer reserva
  
- **Usuários normais** podem apenas:
  - Ver equipamentos e disponibilidade
  - Fazer suas próprias reservas
  - Ver suas reservas

## 📝 Criar Múltiplos Admins

Para adicionar mais administradores, repita o processo:

1. Peça para a pessoa criar uma conta
2. Execute o comando SQL com o email dela:

```sql
SELECT public.make_user_admin('email_novo_admin@exemplo.com');
```

## ❓ Problemas Comuns

### "Não consigo acessar /admin"
- Verifique se executou o comando `make_user_admin`
- Faça logout e login novamente
- Confirme que está usando o email correto

### "Não vejo o botão Admin"
- Você precisa estar logado
- Sua conta precisa ter role de admin
- Tente fazer logout e login novamente

### "Erro ao criar equipamento"
- Confirme que sua conta é admin
- Verifique se o nome do equipamento é único

## 🎯 Próximos Passos

Após configurar o admin:

1. **Adicione Equipamentos**
   - Vá para aba "Equipamentos" no admin
   - Cadastre os equipamentos disponíveis

2. **Configure Horários** (Opcional)
   - As faixas padrão já estão criadas
   - Você pode adicionar mais se necessário
   - Mas agora os usuários podem escolher QUALQUER horário

3. **Gerencie Reservas**
   - Aba "Reservas" mostra todas as reservas
   - Você pode cancelar qualquer reserva

## 📞 Suporte

Se tiver problemas, verifique:
- Console do navegador (F12) para erros
- Logs do Supabase no dashboard
- Se a conta foi criada corretamente
