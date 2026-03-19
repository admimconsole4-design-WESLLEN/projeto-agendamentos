# 📚 Exemplos de Uso dos Testes

Este documento fornece exemplos práticos de como executar e utilizar a bateria de testes do sistema de agendamento.

## 🚀 Execução Rápida

### 1. Executar Todos os Testes

```bash
npm run test:all
```

Este comando executa toda a bateria de testes e gera um relatório detalhado.

### 2. Executar em Modo Watch

```bash
npm test
```

Mantém os testes rodando automaticamente sempre que você fizer alterações.

### 3. Executar com Interface Visual

```bash
npm run test:ui
```

Abre uma interface visual interativa para executar e debugar os testes.

## 📋 Execução de Testes Específicos

### Por Suite de Testes

```bash
# Teste 1: Agendamento de Múltiplos Equipamentos
npm run test:run -- -t "Teste 1"

# Teste 2: Conflitos de Horário
npm run test:run -- -t "Teste 2"

# Teste 3: Validação de Dados
npm run test:run -- -t "Teste 3"
```

### Por Palavra-chave

```bash# Todos os testes sobre agendamento
npm run test:run -- -t "agendamento"

# Todos os testes sobre conflitos
npm run test:run -- -t "conflito"

# Todos os testes sobre performance
npm run test:run -- -t "performance"
```

### Por Caso de Teste Específico

```bash
# Teste específico
npm run test:run -- -t "deve criar agendamentos para diferentes equipamentos"
```

## 📊 Relatórios e Cobertura

### Gerar Relatório de Cobertura

```bash
npm run test:coverage
```

Gera um relatório HTML em `coverage/index.html` com:
- Porcentagem de cobertura do código
- Linhas não cobertas
- Funções não testadas
- Branches não cobertos

### Visualizar Relatório

```bash
# No Linux/Mac
open coverage/index.html

# No Windows
start coverage/index.html
```

## 🔧 Exemplos Práticos

### Exemplo 1: Validar uma Nova Feature

Você adicionou uma nova feature de agendamento recorrente e quer testar:

```bash
# 1. Execute os testes existentes para garantir que nada quebrou
npm run test:run

# 2. Execute apenas os testes relacionados a agendamento
npm run test:run -- -t "agendamento"

# 3. Execute em modo watch enquanto desenvolve
npm test
```

### Exemplo 2: Debugar um Teste Falhando

```bash
# 1. Execute apenas o teste que está falhando
npm run test:run -- -t "nome do teste que falha"

# 2. Execute com interface visual para debugar
npm run test:ui

# 3. Adicione console.log no teste e execute novamente
npm run test:run -- -t "nome do teste"
```

### Exemplo 3: Validar Performance

```bash
# Execute apenas os testes de performance
npm run test:run -- -t "Performance"

# Execute com relatório de cobertura
npm run test:coverage
```

### Exemplo 4: Testar Antes do Deploy

```bash
# Execute a bateria completa de testes
npm run test:all

# Verifique o relatório gerado
cat test-report.json

# Se todos passaram, faça o deploy
```

## 📈 Interpretação dos Resultados

### Sucesso

```
✓ Teste 1: Agendamento de Múltiplos Equipamentos (234ms)
✓ Teste 2: Conflitos de Horário (156ms)
✓ Teste 3: Validação de Dados (189ms)

Test Files  1 passed (1)
     Tests  25 passed (25)
  Start at  19:30:00
  Duration  2s
```

### Falha

```
✗ Teste 3: Validação de Dados (45ms)
  ✗ deve rejeitar reserva sem equipmentId (12ms)
  Error: Expected request to fail but it succeeded

Test Files  1 failed (1)
     Tests  24 passed | 1 failed (25)
  Start at  19:30:00
  Duration  2s
```

## 🛠️ Solução de Problemas

### Problema: Testes Falham Aleatoriamente

**Causa:** Pode ser problema de concorrência ou estado compartilhado.

**Solução:**
```bash
# Execute um teste por vez
npm run test:run -- --reporter=verbose --no-parallel

# Limpe o banco de dados
npm run db:reset

# Execute novamente
npm run test:run
```

### Problema: Testes Muito Lentos

**Causa:** Pode ser problema de performance do banco ou muitas operações.

**Solução:**
```bash
# Execute apenas os testes críticos
npm run test:run -- -t "CRITICAL"

# Execute com timeout maior
npm run test:run -- --test-timeout=10000
```

### Problema: Erro de Conexão com Banco

**Causa:** Banco de dados não está rodando ou configurado incorretamente.

**Solução:**
```bash
# Verifique se o Prisma está configurado
npx prisma generate

# Resete o banco
npm run db:reset

# Execute novamente
npm run test:run
```

## 📝 Checklist Antes de Commitar

Antes de fazer commit das suas alterações:

- [ ] Execute todos os testes: `npm run test:run`
- [ ] Verifique a cobertura: `npm run test:coverage`
- [ ] Execute a bateria completa: `npm run test:all`
- [ ] Verifique se não há warnings ou erros
- [ ] Confirme que todos os testes passam

## 🎯 Dicas de Produtividade

### 1. Use Modo Watch Durante Desenvolvimento

```bash
npm test
```

Os testes re-executam automaticamente quando você salva.

### 2. Use a Interface Visual para Debugar

```bash
npm run test:ui
```

Permite executar testes individualmente e ver os resultados em tempo real.

### 3. Filtre Testes Específicos

```bash
npm run test:run -- -t "palavra chave"
```

Economiza tempo executando apenas os testes relevantes.

### 4. Use Snapshots para Testes de UI

```bash
npm run test:run -- -u
```

Atualiza snapshots automaticamente.

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

## 💡 Padrões de Testes

### Teste de Unidade

```typescript
it('deve criar uma reserva', async () => {
  const reservation = await prisma.reservation.create({
    data: {
      equipmentId: equipment.id,
      name: 'Professor Teste',
      date: '2026-03-20',
      periodId: period.id,
      lessonNumber: 1
    }
  });

  expect(reservation).toBeDefined();
  expect(reservation.id).toBeDefined();
});
```

### Teste de Integração

```typescript
it('deve criar múltiplas reservas e verificar no banco', async () => {
  // Criar reservas
  await createMultipleReservations();

  // Verificar no banco
  const count = await prisma.reservation.count();
  expect(count).toBeGreaterThan(0);
});
```

### Teste de Performance

```typescript
it('deve buscar reservas rapidamente', async () => {
  const startTime = Date.now();
  const reservations = await prisma.reservation.findMany();
  const endTime = Date.now();

  expect(endTime - startTime).toBeLessThan(1000);
});
```

## 🤝 Contribuindo

Para adicionar novos exemplos:

1. Adicione o exemplo neste arquivo
2. Inclua descrição clara do objetivo
3. Forneça comandos executáveis
4. Explique os resultados esperados

## 📞 Suporte

Para mais informações, consulte:
- [README.md](./README.md) - Documentação completa dos testes
- [reservation.test.ts](./reservation.test.ts) - Código dos testes
- [setup.ts](./setup.ts) - Configuração do ambiente
