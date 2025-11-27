# Sistema de Reserva de Equipamentos

Sistema completo de gerenciamento de reservas de equipamentos com autenticação e controle de horários livres.

## 🚀 Novidades da Última Versão

### ✅ Horários Livres
- Escolha QUALQUER horário de início e fim
- Exemplos: 8:00-9:30, 14:00-16:45, 10:15-12:00
- Não está mais limitado às faixas pré-definidas

### ✅ Calendário Completo
- Todas as datas futuras liberadas
- Reserve com antecedência ilimitada

### ✅ Sistema de Autenticação
- Login obrigatório para fazer reservas
- Painel administrativo protegido por autenticação
- Apenas admins podem gerenciar equipamentos

## 📖 Configuração Inicial

### 1. Criar Primeiro Administrador

**IMPORTANTE**: Leia o arquivo [INSTRUCOES_ADMIN.md](./INSTRUCOES_ADMIN.md) para instruções detalhadas.

**Resumo rápido:**
1. Acesse `/auth` e crie uma conta
2. Execute no banco de dados: 
   ```sql
   SELECT public.make_user_admin('seu@email.com');
   ```
3. Faça login e acesse `/admin`

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (PostgreSQL + Supabase Auth)
- **Autenticação**: Supabase Auth com RLS
- **Validações**: Zod + PostgreSQL Constraints
- **Datas**: date-fns
- **UI Components**: Radix UI

## ✨ Funcionalidades

### Para Usuários Autenticados
- 📅 **Calendário Completo**: Todas as datas futuras disponíveis
- ⏰ **Horários Livres**: Escolha qualquer horário (ex: 8:00-9:30, 14:15-16:45)
- 🎥 **Lista de Equipamentos**: Veja status em tempo real
- ✅ **Reserva Fácil**: Formulário com validações
- 🔒 **Proteção Automática**: Sistema impede dupla reserva

### Para Administradores
- ➕ **Gerenciar Equipamentos**: Adicionar, editar, remover
- ⏰ **Configurar Horários**: Adicionar faixas (opcional, apenas referência)
- 📊 **Ver Todas Reservas**: Lista completa com filtros
- 🗑️ **Cancelar Qualquer Reserva**: Controle total
- 👤 **Controle de Acesso**: Rota protegida por autenticação

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `equipments`
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE) 
- description (TEXT, opcional)
- created_at, updated_at (TIMESTAMP)
```

#### `time_slots` (Opcional/Referência)
```sql
- id (UUID, PK)
- start_time (TIME)
- end_time (TIME)
- label (TEXT) - ex: "Manhã", "Tarde"
- created_at, updated_at (TIMESTAMP)
```

#### `reservations`
```sql
- id (UUID, PK)
- equipment_id (UUID, FK -> equipments)
- name (TEXT)
- phone (TEXT)
- date (DATE)
- start_time (TIME) - QUALQUER horário
- end_time (TIME) - QUALQUER horário
- created_at, updated_at (TIMESTAMP)
```

#### `user_roles` (Autenticação)
```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- role (app_role ENUM: 'admin', 'user')
- created_at (TIMESTAMP)
```

## 🔒 Proteção contra Race Conditions

O sistema usa **transaction locking** no PostgreSQL para evitar dupla reserva:

```sql
-- Função check_reservation_conflict usa:
LOCK TABLE reservations IN SHARE ROW EXCLUSIVE MODE;
-- Garante que apenas uma transação pode verificar/criar reserva por vez
```

### Como Funciona
1. Usuário tenta criar reserva
2. Sistema inicia transação e aplica lock
3. Verifica sobreposição de horários
4. Se livre: cria reserva
5. Se ocupado: retorna erro
6. Libera lock após commit/rollback

## 📋 Regras de Negócio

### Validações
- ✅ Login obrigatório para reservar
- ✅ Nome obrigatório (não vazio)
- ✅ Telefone: 10-15 dígitos
- ✅ Horário início < horário fim
- ✅ Data não pode ser no passado
- ✅ Equipamento livre no intervalo completo
- ✅ Qualquer horário permitido (ex: 8:15, 14:45, 20:30)

### Permissões (RLS Policies)
- **Público**: Pode visualizar equipamentos e time_slots
- **Usuários Autenticados**: Podem criar reservas
- **Admins**: 
  - CRUD completo em equipamentos
  - CRUD completo em time_slots
  - Cancelar qualquer reserva
  - Ver todas as reservas

### Verificação de Conflitos
```sql
-- Sobreposição detectada se:
NOT (end_time <= start_time_novo OR start_time >= end_time_novo)
```

### Remoção de Equipamentos
- ❌ **Bloqueada** se houver reservas ativas
- Retorna erro com mensagem explicativa

## 🚦 Como Usar

### 1. Acesso Público (Visualização Apenas)
- Qualquer pessoa pode ver equipamentos
- Pode visualizar calendário
- **Para reservar**: precisa criar conta e fazer login

### 2. Criar Conta e Fazer Reservas

#### Passo a Passo:

1. **Criar Conta**:
   - Clique em "Entrar" no topo da página
   - Vá para aba "Criar Conta"
   - Preencha email e senha (mínimo 6 caracteres)
   - Clique "Criar Conta"
   - Você receberá confirmação

2. **Fazer Login**:
   - Use email e senha cadastrados
   - Você será redirecionado automaticamente para a página principal

3. **Fazer Reserva**:
   - Selecione a **data** no calendário
   - Escolha um **equipamento disponível** (badge verde)
   - Clique no botão **"Reservar"**
   - No formulário, preencha:
     - **Nome**: Seu nome completo
     - **Telefone**: (11) 98888-7777
     - **Horário início**: Ex: 08:00, 14:30, 09:15
     - **Horário fim**: Ex: 09:30, 16:45, 11:00
   - Clique em **"Confirmar Reserva"**

### 3. Painel Admin (Apenas Administradores)

**⚠️ Configuração Necessária**: Antes de acessar, configure o primeiro admin seguindo [INSTRUCOES_ADMIN.md](./INSTRUCOES_ADMIN.md)

#### Funcionalidades Admin:

**Gerenciar Equipamentos**:
1. Acesse `/admin` (botão "Admin" no topo)
2. Vá para aba "Equipamentos"
3. Preencha nome e descrição
4. Clique "Adicionar Equipamento"
5. Para remover: clique no ícone de lixeira

**Configurar Horários** (Opcional):
1. Aba "Horários"
2. Defina horário início e fim
3. Adicione etiqueta (ex: "Manhã")
4. Clique "Adicionar Faixa"

**Nota**: As faixas são apenas referência visual. Usuários podem escolher QUALQUER horário.

**Visualizar/Cancelar Reservas**:
1. Aba "Reservas"
2. Veja lista completa de todas as reservas
3. Para cancelar: clique no ícone de lixeira

## 🎨 Design System

### Cores Principais
- **Primary**: Azul (#2563EB) - Ações principais
- **Available**: Verde (#10B981) - Equipamento disponível  
- **Occupied**: Vermelho (#EF4444) - Equipamento ocupado
- **Muted**: Cinza - Textos secundários

### Componentes
- **Cards**: Equipamentos e seções
- **Badges**: Status de disponibilidade
- **Modal**: Formulário de reserva
- **Calendar**: Seletor de datas (sem limites)
- **Tables**: Lista de reservas e admin
- **Inputs Time**: Escolha livre de horários

## 📦 Seed Data (Dados Iniciais)

O sistema já vem com:

### Equipamentos
- Câmera A (Sony Alpha)
- Câmera B (Canon EOS R5)
- Microfone 1 (Shure SM7B)
- Notebook (MacBook Pro 16")
- Tripé (Manfrotto)

### Faixas Horárias (Referência)
- 07:00 - 11:20 (Manhã)
- 13:00 - 17:00 (Tarde)
- 18:00 - 21:00 (Noite)

**Nota**: Essas faixas são apenas sugestões. Usuários podem escolher qualquer horário.

## 🧪 Casos de Teste

### 1. Reserva Simultânea
- Duas pessoas tentam reservar mesmo equipamento/horário
- ✅ Apenas uma reserva é criada
- ❌ Segunda recebe erro de conflito

### 2. Sobreposição Parcial
- Reserva A: 08:00-10:00
- Tentativa B: 09:00-11:00
- ❌ Bloqueado (sobreposição)

### 3. Horários Livres
- Reserva A: 08:15-09:45
- Reserva B: 14:30-16:45
- ✅ Ambas permitidas

### 4. Remoção com Reservas
- Tentar remover equipamento reservado
- ❌ Erro: "existem reservas ativas"

### 5. Proteção de Acesso
- Usuário não-admin tenta acessar `/admin`
- ❌ Redirecionado para home

## 🔧 Estrutura do Código

```
src/
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   ├── AuthGuard.tsx        # Proteção de rotas
│   ├── EquipmentCard.tsx    # Card de equipamento
│   ├── ReservationModal.tsx # Modal de reserva (horários livres)
│   └── ReservationsList.tsx # Tabela de reservas
├── pages/
│   ├── Home.tsx             # Página principal
│   ├── Admin.tsx            # Painel admin (protegido)
│   ├── Auth.tsx             # Login/Signup
│   └── NotFound.tsx         # 404
├── lib/
│   ├── auth.ts              # Funções de autenticação
│   ├── supabase.ts          # Funções de API
│   └── utils.ts             # Utilitários
└── integrations/
    └── supabase/            # Cliente auto-gerado
```

## 📝 Exemplos de Uso da API

### Criar Reserva
```typescript
import { createReservation } from "@/lib/supabase";

await createReservation(
  "equipment-uuid",
  "João Silva",
  "11988887777",
  "2025-12-15",
  "08:15:00",  // Qualquer horário!
  "10:45:00"   // Qualquer horário!
);
```

### Verificar Disponibilidade
```typescript
import { checkEquipmentAvailability } from "@/lib/supabase";

const isAvailable = await checkEquipmentAvailability(
  "equipment-uuid",
  "2025-12-15",
  "14:30:00",
  "16:45:00"
);
```

### Verificar se é Admin
```typescript
import { isAdmin } from "@/lib/auth";

const adminStatus = await isAdmin(userId);
```

## 🔐 Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Políticas específicas por role (admin/user)
- Queries protegidas pelo Supabase

### Validações
- ✅ Server-side (PostgreSQL constraints + functions)
- ✅ Client-side (React forms + Zod)
- ✅ Sanitização de inputs
- ✅ Proteção contra SQL injection
- ✅ Auth tokens gerenciados automaticamente

### Funções Seguras
- `SET search_path = public` em todas as funções
- `SECURITY DEFINER` apropriado
- Locks de transação para concorrência
- Verificação de roles antes de operações críticas

## 🌐 SEO e Acessibilidade

- ✅ Meta tags otimizadas
- ✅ Títulos semânticos (H1, H2)
- ✅ Labels em formulários
- ✅ Navegação por teclado
- ✅ Contraste adequado (WCAG AA)

## 🚀 Deploy

O sistema roda automaticamente no Lovable Cloud:
- ✅ Frontend hospedado
- ✅ Backend PostgreSQL gerenciado
- ✅ Autenticação configurada
- ✅ RLS policies aplicadas

## 📖 Próximas Funcionalidades (Sugestões)

- [ ] Notificações por email após reserva
- [ ] Exportar reservas para CSV/Excel
- [ ] Calendário visual por equipamento
- [ ] Histórico de reservas do usuário
- [ ] Sistema de avaliação de equipamentos
- [ ] Reservas recorrentes
- [ ] Multi-idioma
- [ ] Temas personalizados
- [ ] App mobile (PWA)

## 🆘 Troubleshooting

### "Você precisa estar logado para fazer uma reserva"
- ✅ Normal se não estiver logado
- Solução: Clique em "Entrar" e faça login/cadastro

### "Equipamento já reservado"
- ✅ Normal: outro usuário reservou primeiro
- Solução: escolha outro horário ou equipamento

### Não consigo remover equipamento
- ✅ Normal: existem reservas ativas
- Solução: cancele as reservas primeiro (no painel admin)

### Não vejo o botão "Admin"
- Verifique se sua conta é admin
- Execute: `SELECT public.make_user_admin('seu@email.com');`
- Faça logout e login novamente

### Erro "requested path is invalid" no login
- Verifique configurações de URL no Lovable Cloud
- Vá até Backend → Auth Settings → Site URL

### Calendário não atualiza após reserva
- Recarregue a página (F5)
- Verifique se a reserva foi criada (aba Admin → Reservas)

## 📞 Contato e Suporte

Para problemas técnicos:
1. Verifique console do navegador (F12)
2. Veja logs do backend no Lovable Cloud
3. Confirme que seguiu todas as etapas de configuração
4. Leia o [INSTRUCOES_ADMIN.md](./INSTRUCOES_ADMIN.md)

## 📄 Arquivos Importantes

- `README.md` - Este arquivo
- `INSTRUCOES_ADMIN.md` - Como configurar administradores
- `src/lib/auth.ts` - Lógica de autenticação
- `src/lib/supabase.ts` - Funções de banco de dados
- `src/components/AuthGuard.tsx` - Proteção de rotas

## 📊 Estatísticas do Projeto

- **Linhas de código**: ~2500+ linhas
- **Componentes React**: 12+
- **Páginas**: 4 (Home, Admin, Auth, NotFound)
- **Tabelas DB**: 4 (equipments, reservations, time_slots, user_roles)
- **Funções DB**: 3 (update_updated_at, check_reservation_conflict, is_admin)
- **RLS Policies**: 12+

---

**Desenvolvido com ❤️ usando Lovable Cloud**

Sistema completo de ponta a ponta: Frontend React + Backend PostgreSQL + Autenticação Supabase
