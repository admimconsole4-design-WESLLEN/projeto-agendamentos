# Sistema de Reserva de Equipamentos

Sistema completo de gerenciamento de reservas de equipamentos com interface moderna e funcionalidades avançadas.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (PostgreSQL + Edge Functions)
- **ORM**: Supabase Client
- **Validações**: Zod
- **Datas**: date-fns
- **UI Components**: Radix UI

## ✨ Funcionalidades

### Para Usuários
- 📅 **Calendário Visual**: Selecione datas e visualize disponibilidade
- 🎥 **Lista de Equipamentos**: Veja todos equipamentos com status (disponível/ocupado)
- ✅ **Reserva Fácil**: Formulário intuitivo com validações
- 🔒 **Proteção contra Conflitos**: Sistema impede dupla reserva automática
- 📱 **Design Responsivo**: Funciona em desktop, tablet e mobile

### Para Administradores
- ➕ **Gerenciar Equipamentos**: Adicionar e remover equipamentos
- ⏰ **Configurar Horários**: Definir faixas horárias (manhã, tarde, noite)
- 📊 **Visualizar Reservas**: Lista completa com filtros
- 🗑️ **Cancelar Reservas**: Gerenciar cancelamentos

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `equipments`
```sql
- id (UUID, PK)
- name (TEXT, UNIQUE) 
- description (TEXT, opcional)
- created_at, updated_at (TIMESTAMP)
```

#### `time_slots`
```sql
- id (UUID, PK)
- start_time (TIME)
- end_time (TIME)
- label (TEXT, opcional - ex: "Manhã")
- created_at, updated_at (TIMESTAMP)
```

#### `reservations`
```sql
- id (UUID, PK)
- equipment_id (UUID, FK -> equipments)
- name (TEXT)
- phone (TEXT)
- date (DATE)
- start_time (TIME)
- end_time (TIME)
- created_at, updated_at (TIMESTAMP)
```

### Índices e Constraints
- Índice otimizado para consultas de disponibilidade
- CHECK constraints para validar horários
- Proteção contra reservas no passado
- ON DELETE RESTRICT para equipamentos com reservas

## 🔒 Proteção contra Race Conditions

O sistema usa **transaction locking** no PostgreSQL para evitar dupla reserva:

```sql
-- Função check_reservation_conflict usa:
LOCK TABLE reservations IN SHARE ROW EXCLUSIVE MODE;
-- Garante que apenas uma transação pode verificar/criar reserva por vez
```

### Como Funciona
1. Cliente tenta criar reserva
2. Sistema inicia transação e aplica lock
3. Verifica sobreposição de horários
4. Se livre: cria reserva
5. Se ocupado: retorna erro 409 (Conflito)
6. Libera lock após commit/rollback

## 📋 Regras de Negócio

### Validações
- ✅ Nome obrigatório (não vazio)
- ✅ Telefone: 10-15 dígitos
- ✅ Horário início < horário fim
- ✅ Data não pode ser no passado
- ✅ Equipamento deve estar livre no intervalo completo

### Verificação de Conflitos
```sql
-- Sobreposição detectada se:
NOT (end_time <= start_time_novo OR start_time >= end_time_novo)
```

### Remoção de Equipamentos
- ❌ **Bloqueada** se houver reservas ativas
- Retorna erro explicativo ao tentar remover

## 🚦 Como Usar

### Acesso Público (Fazer Reservas)

1. **Selecione a Data** no calendário
2. **Visualize Equipamentos** disponíveis (badge verde)
3. **Clique em "Reservar"** no equipamento desejado
4. **Preencha o Formulário**:
   - Nome completo
   - Telefone (11) 98888-7777
   - Selecione horário início e fim
5. **Confirme** - Sistema valida e cria reserva

### Painel Admin

Acesse via botão "Admin" no topo da página.

#### Gerenciar Equipamentos
1. Vá para aba "Equipamentos"
2. Preencha nome e descrição
3. Clique "Adicionar Equipamento"
4. Para remover: clique no ícone de lixeira

#### Configurar Horários
1. Vá para aba "Horários"
2. Defina horário início e fim
3. Opcional: adicione etiqueta (ex: "Manhã")
4. Clique "Adicionar Faixa"

#### Visualizar/Cancelar Reservas
1. Vá para aba "Reservas"
2. Veja lista completa com todos os detalhes
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
- **Calendar**: Seletor de datas
- **Tables**: Lista de reservas e admin

## 📦 Seed Data (Dados Iniciais)

O sistema já vem com:

### Equipamentos
- Câmera A (Sony Alpha)
- Câmera B (Canon EOS R5)
- Microfone 1 (Shure SM7B)
- Notebook (MacBook Pro 16")
- Tripé (Manfrotto)

### Faixas Horárias
- 07:00 - 11:20 (Manhã)
- 13:00 - 17:00 (Tarde)
- 18:00 - 21:00 (Noite)

## 🧪 Testes e Validações

### Casos de Teste Principais

1. **Reserva Simultânea**
   - Duas pessoas tentam reservar mesmo equipamento/horário
   - ✅ Apenas uma reserva é criada
   - ❌ Segunda recebe erro 409

2. **Sobreposição Parcial**
   - Reserva A: 08:00-10:00
   - Tentativa B: 09:00-11:00
   - ❌ Bloqueado (sobreposição)

3. **Remoção com Reservas**
   - Tentar remover equipamento reservado
   - ❌ Erro: "existem reservas ativas"

4. **Validação de Formulário**
   - Nome vazio → erro
   - Telefone inválido → erro
   - Horário fim < início → erro

## 🔧 Estrutura do Código

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── EquipmentCard.tsx    # Card de equipamento
│   ├── ReservationModal.tsx # Modal de reserva
│   └── ReservationsList.tsx # Tabela de reservas
├── pages/
│   ├── Home.tsx        # Página principal (calendário)
│   ├── Admin.tsx       # Painel administrativo
│   └── NotFound.tsx    # 404
├── lib/
│   ├── supabase.ts     # Funções de API
│   └── utils.ts        # Utilitários
└── integrations/
    └── supabase/       # Cliente auto-gerado
```

## 📝 Exemplos de Uso da API

### Criar Reserva
```typescript
import { createReservation } from "@/lib/supabase";

await createReservation(
  "equipment-uuid",
  "João Silva",
  "11988887777",
  "2025-12-01",
  "07:30:00",
  "09:00:00"
);
```

### Verificar Disponibilidade
```typescript
import { checkEquipmentAvailability } from "@/lib/supabase";

const isAvailable = await checkEquipmentAvailability(
  "equipment-uuid",
  "2025-12-01",
  "07:30:00",
  "09:00:00"
);
```

### Listar Equipamentos
```typescript
import { getEquipments } from "@/lib/supabase";

const equipments = await getEquipments();
```

## 🌐 SEO e Acessibilidade

- ✅ Meta tags otimizadas
- ✅ Títulos semânticos (H1, H2)
- ✅ Labels em formulários
- ✅ Botões com aria-labels
- ✅ Navegação por teclado
- ✅ Contraste adequado (WCAG AA)

## 🔐 Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Políticas públicas (sem autenticação nesta versão)
- Queries protegidas pelo Supabase

### Validações
- ✅ Server-side (PostgreSQL constraints)
- ✅ Client-side (React forms)
- ✅ Sanitização de inputs
- ✅ Proteção contra SQL injection (Supabase client)

### Funções de Segurança
- `SET search_path = public` em todas as funções
- `SECURITY DEFINER` apropriado
- Locks de transação para concorrência

## 🚀 Deploy

O sistema roda automaticamente no Lovable Cloud:
- Frontend hospedado na Lovable
- Backend gerenciado automaticamente
- Banco PostgreSQL provisionado
- Edge Functions deployadas

## 📖 Próximas Funcionalidades (Opcionais)

- [ ] Sistema de autenticação de usuários
- [ ] Notificações por email/SMS
- [ ] Exportar reservas para CSV
- [ ] Calendário por equipamento
- [ ] Relatórios e estatísticas
- [ ] Multi-idioma
- [ ] Temas personalizados

## 🆘 Troubleshooting

### "Equipamento já reservado"
- ✅ Normal: outro usuário reservou primeiro
- Solução: escolha outro horário

### Não consigo remover equipamento
- ✅ Normal: existem reservas ativas
- Solução: cancele as reservas primeiro

### Calendário não atualiza
- Solução: Recarregue a página (F5)

## 📄 Licença

Este projeto foi criado para fins educacionais e pode ser usado livremente.

---

**Desenvolvido com ❤️ usando Lovable Cloud**
