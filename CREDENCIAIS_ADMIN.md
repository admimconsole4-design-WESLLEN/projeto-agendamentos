# Credenciais do Administrador

## Passo 1: Criar a Conta Admin

⚠️ **IMPORTANTE**: Você precisa criar a conta primeiro através da interface de cadastro:

1. Acesse a página `/auth`
2. Clique na aba **"Criar Conta"**
3. Use estas credenciais:
   - **Email:** `admin@sistema.com`
   - **Senha:** `Admin@2024`
4. Clique em **"Criar Conta"**

## Passo 2: Promover a Admin

Após criar a conta, você precisa promovê-la para administrador:

1. Abra o backend clicando no botão abaixo:

**[Clique aqui para abrir o Backend]**

2. Vá até **Database** → **SQL Editor**
3. Execute este comando:

```sql
SELECT public.make_user_admin('admin@sistema.com');
```

4. Faça logout e login novamente

## Como Acessar o Painel Admin

1. Faça login com `admin@sistema.com` / `Admin@2024`
2. Clique no botão **"Admin"** no canto superior direito

## Importante

⚠️ **Segurança**: Estas credenciais foram geradas automaticamente para desenvolvimento. Em produção, recomenda-se alterar a senha após o primeiro acesso.

## Funcionalidades do Administrador

Como administrador, você pode:
- ✅ Cadastrar novos equipamentos
- ✅ Editar e excluir equipamentos existentes
- ✅ Visualizar todas as reservas
- ✅ Excluir reservas
- ✅ Gerenciar horários do sistema

## Observações

- **Reservas públicas**: Qualquer pessoa pode fazer reservas sem precisar de login, apenas fornecendo nome e telefone.
- **Painel Admin**: Apenas usuários com perfil de administrador podem acessar o painel de gerenciamento.
