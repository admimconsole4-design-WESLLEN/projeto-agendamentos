# Sistema de Agendamento com SQLite + Express API

## 📋 Visão Geral

O sistema foi migrado com sucesso do **Supabase** para **SQLite + Prisma + Express API**, tornando-o ideal para uso local sem necessidade de servidores na nuvem ou configurações complexas.

## 🎯 Arquitetura

```
Frontend (React + Vite)
    ↓
Backend API (Express + TypeScript)
    ↓
Banco de Dados (SQLite + Prisma)
```

## ✨ Vantagens da Migração

- ✅ **100% Local**: Sem dependência de serviços na nuvem
- ✅ **Simplicidade**: Arquivo único de banco de dados (`prisma/dev.db`)
- ✅ **Portabilidade**: Backup = copiar arquivo `.db`
- ✅ **Performance**: Queries instantâneas
- ✅ **API REST**: Backend separado para melhor organização
- ✅ **Limpeza Automática**: Reservas expiram automaticamente a cada 5 minutos

## 🚀 Como Usar

### Primeira Vez

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco de dados e inserir dados iniciais
npm run db:seed

# 3. Build do frontend
npm run build

# 4. Iniciar o servidor completo (frontend + backend)
npm run server
```

Acesse: **http://localhost:3001**

### Desenvolvimento

```bash
# Terminal 1: Frontend em modo desenvolvimento
npm run dev
# Acesse: http://localhost:5173

# Terminal 2: Backend API
npm run server
# API em: http://localhost:3001
```

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend Vite (porta 5173)
npm run server           # Backend Express (porta 3001)

# Build
npm run build            # Build do frontend para produção
npm run dev:full         # Build + servidor completo

# Banco de Dados
npm run db:seed          # Inserir dados iniciais
npm run db:reset         # Resetar banco de dados (cuidado!)

# Prisma
npx prisma studio        # Interface visual do banco
npx prisma generate      # Gerar cliente Prisma
```

## 📁 Estrutura do Projeto

```
equipa-agendada/
├── prisma/
│   ├── dev.db              # Banco de dados SQLite
│   ├── schema.prisma       # Schema do banco
│   ├── seed.ts             # Script de dados iniciais
│   └── migrations/         # Histórico de mudanças
├── src/
│   ├── lib/
│   │   ├── db.ts           # Cliente Prisma (backend)
│   │   ├── cleanup.ts      # Limpeza automática (backend)
│   │   ├── api.ts          # Cliente da API (frontend)
│   │   └── supabase.ts     # Tipos e exportações
│   └── components/         # Componentes React
├── dist/                   # Frontend buildado
├── server.ts               # Backend Express
└── package.json
```

## 🗄️ API REST Endpoints

### Equipamentos

```
GET    /api/equipments          # Listar todos
POST   /api/equipments          # Criar
DELETE /api/equipments/:id      # Deletar
```

### Time Slots (Faixas Horárias)

```
GET    /api/time-slots          # Listar todos
POST   /api/time-slots          # Criar
DELETE /api/time-slots/:id      # Deletar
```

### Reservas

```
GET    /api/reservations        # Listar todas (opcional: ?date=YYYY-MM-DD)
POST   /api/reservations        # Criar
DELETE /api/reservations/:id    # Deletar
POST   /api/check-availability  # Verificar disponibilidade
```

## 🔄 Limpeza Automática

O servidor remove automaticamente reservas expiradas a cada **5 minutos**:

- Reservas de dias anteriores são removidas
- Reservas de hoje que já terminaram são removidas

**Exemplo**: Se são 14:00 de 19/03/2026, uma reserva para 19/03/2026 das 13:00 às 14:00 já foi removida.

## 💾 Backup e Restore

### Backup
```bash
# Basta copiar o arquivo do banco
cp prisma/dev.db backup-dev.db

# Ou fazer backup com data
cp prisma/dev.db backup-$(date +%Y%m%d).db
```

### Restore
```bash
# Parar o servidor primeiro (Ctrl+C)
# Depois restaurar o backup
cp backup-dev.db prisma/dev.db

# Reiniciar o servidor
npm run server
```

## 🛠️ Solução de Problemas

### Erro: "EADDRINUSE: address already in use"
```bash
# Matar processo na porta 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <numero_do_processo> /F
```

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Resetar tudo
```bash
npm run db:reset
```

### Frontend não carrega
```bash
# Certifique-se de fazer o build antes
npm run build
npm run server
```

## 📊 Dados Iniciais

O seed cria automaticamente:

**3 Faixas Horárias:**
- Manhã: 07:00 - 11:20
- Tarde: 13:00 - 17:00
- Noite: 18:00 - 21:00

**5 Equipamentos:**
- Câmera A (Sony Alpha)
- Câmera B (Canon EOS R5)
- Microfone 1 (Shure SM7B)
- Notebook (MacBook Pro 16")
- Tripé (Manfrotto)

## 🎨 Funcionalidades

- ✅ Visualizar equipamentos disponíveis
- ✅ Criar reservas com verificação de conflitos
- ✅ Visualizar horários ocupados
- ✅ Gerenciar equipamentos (adicionar/remover)
- ✅ Gerenciar faixas horárias
- ✅ Limpeza automática de reservas expiradas
- ✅ Interface responsiva e intuitiva
- ✅ API REST completa

## 🚀 Deploy

Para produção:

```bash
# 1. Build da aplicação
npm run build

# 2. O banco de dados SQLite estará em prisma/dev.db
# 3. Copie este arquivo para o servidor de produção

# 4. Iniciar o servidor
npm run server
```

## 🔧 Variáveis de Ambiente

```env
# .env
VITE_API_URL=http://localhost:3001
DATABASE_URL="file:./dev.db"
```

## 📝 Notas Importantes

- O sistema usa **SQLite** ideal para uso local/single-user
- Para múltiplos usuários simultâneos, considere usar **PostgreSQL**
- O arquivo do banco pode ser versionado no Git (se contiver dados de teste)
- Para produção, use variáveis de ambiente para configurar o caminho do banco
- O servidor Express serve o frontend buildado e a API na mesma porta

## 🎉 Conclusão

O sistema agora é **100% local** com backend próprio e não depende de serviços externos. 

**Para usar:**
1. `npm run build` - Build do frontend
2. `npm run server` - Inicia backend + frontend
3. Acesse `http://localhost:3001`

**Sistema pronto para uso!** 🚀
