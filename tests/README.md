# 🧪 Bateria de Testes - Sistema de Agendamento

Este documento descreve a bateria completa de testes automatizados para o sistema de agendamento de equipamentos escolares.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura dos Testes](#estrutura-dos-testes)
- [Como Executar](#como-executar)
- [Suites de Testes](#suites-de-testes)
- [Relatórios](#relatórios)

## 🎯 Visão Geral

A bateria de testes foi projetada para validar todos os aspectos do sistema de agendamento, incluindo:

- ✅ Criação de reservas
- ✅ Validação de conflitos
- ✅ Consultas complexas
- ✅ Performance
- ✅ Edge cases
- ✅ Operações CRUD

## 📁 Estrutura dos Testes

```
tests/
├── setup.ts                 # Configuração do ambiente de testes
├── reservation.test.ts      # Suite principal de testes
├── run-all-tests.ts         # Script para executar toda a bateria
└── README.md               # Esta documentação
```

## 🚀 Como Executar

### Executar Todos os Testes

```bash
# Executar todos os testes de uma vez
npm test

# Executar em modo watch (desenvolvimento)
npm run test:run

# Executar com relatório de cobertura
npm run test:coverage

# Executar com interface visual
npm run test:ui

# Executar bateria completa de testes
npm run test:all
```

### Executar Testes Específicos

```bash
# Executar apenas uma suite de testes
npm run test:run -- tests/reservation.test.ts -t "Teste 1"

# Executar testes que correspondem a um padrão
npm run test:run -- tests/reservation.test.ts -t "Agendamento"
```

## 📊 Suites de Testes

### Teste 1: Agendamento de Múltiplos Equipamentos

**Objetivo:** Validar a criação de reservas para diferentes equipamentos.

**Cenários:**
- ✅ Criar agendamentos para diferentes equipamentos na mesma data
- ✅ Criar agendamentos para o mesmo equipamento em datas diferentes

**Validações:**
- Verifica se todas as reservas foram criadas corretamente
- Confirma que os dados das reservas estão corretos
- Valida a persistência no banco de dados

---

### Teste 2: Conflitos de Horário

**Objetivo:** Garantir que o sistema previne conflitos de agendamento.

**Cenários:**
- ✅ Impedir agendamento duplicado (mesmo equipamento, data, período e aula)
- ✅ Permitir agendamento do mesmo equipamento em aulas diferentes
- ✅ Permitir agendamento de equipamentos diferentes no mesmo horário

**Validações:**
- Verifica unicidade de reservas
- Confirma que o sistema rejeita duplicatas
- Valida flexibilidade do sistema

---

### Teste 3: Validação de Dados

**Objetivo:** Validar a integridade dos dados de entrada.

**Cenários:**
- ✅ Rejeitar reserva sem equipmentId
- ✅ Rejeitar reserva sem nome
- ✅ Rejeitar reserva sem data
- ✅ Aceitar telefone opcional

**Validações:**
- Verifica campos obrigatórios
- Confirma validação de dados
- Valida campos opcionais

---

### Teste 4: Agendamento em Lote (Batch)

**Objetivo:** Testar criação de múltiplas reservas de uma vez.

**Cenários:**
- ✅ Criar múltiplas reservas para o mesmo equipamento em um dia
- ✅ Criar reservas para múltiplos equipamentos em múltiplas datas

**Validações:**
- Verifica criação em lote
- Confirma persistência de todas as reservas
- Valida consistência dos dados

---

### Teste 5: Consulta e Disponibilidade

**Objetivo:** Testar consultas e verificação de disponibilidade.

**Cenários:**
- ✅ Listar todas as reservas de uma data específica
- ✅ Listar todas as reservas de um equipamento
- ✅ Verificar disponibilidade de uma aula específica

**Validações:**
- Verifica filtros de consulta
- Confirma relacionamentos
- Valida lógica de disponibilidade

---

### Teste 6: Operações de CRUD

**Objetivo:** Testar operações básicas de banco de dados.

**Cenários:**
- ✅ Criar uma reserva
- ✅ Ler uma reserva
- ✅ Atualizar uma reserva
- ✅ Deletar uma reserva

**Validações:**
- Verifica cada operação CRUD
- Confirma persistência dos dados
- Valida integridade referencial

---

### Teste 7: Cenários de Estresse

**Objetivo:** Validar o sistema sob carga.

**Cenários:**
- ✅ Criar 50 reservas rapidamente
- ✅ Criar reservas para 30 dias consecutivos

**Validações:**
- Verifica performance sob carga
- Confirma estabilidade do sistema
- Valida consistência dos dados

---

### Teste 8: Relações e Consultas Complexas

**Objetivo:** Testar relacionamentos e consultas avançadas.

**Cenários:**
- ✅ Buscar reservas com informações do equipamento
- ✅ Contar reservas por equipamento

**Validações:**
- Verifica relacionamentos
- Confirma joins funcionando
- Valida consultas agregadas

---

### Teste 9: Edge Cases

**Objetivo:** Testar casos extremos e especiais.

**Cenários:**
- ✅ Lidar com caracteres especiais no nome
- ✅ Lidar com nomes muito longos
- ✅ Lidar com datas formatadas de diferentes formas

**Validações:**
- Verifica tratamento de caracteres especiais
- Confirma limites de tamanho
- Valida formatação de datas

---

### Teste 10: Performance

**Objetivo:** Validar performance das operações.

**Cenários:**
- ✅ Buscar 100 reservas rapidamente
- ✅ Contar reservas rapidamente

**Validações:**
- Verifica tempo de resposta
- Confirma eficiência das queries
- Valida escalabilidade

---

## 📈 Relatórios

### Relatório de Execução

Ao executar `npm run test:all`, um relatório detalhado é gerado:

```json
{
  "total": 10,
  "passed": 10,
  "failed": 0,
  "duration": 0,
  "suites": [
    {
      "name": "Teste 1: Agendamento de Múltiplos Equipamentos",
      "status": "passed",
      "duration": 1234
    }
  ]
}
```

### Relatório de Cobertura

Para gerar o relatório de cobertura:

```bash
npm run test:coverage
```

O relatório será gerado em `coverage/index.html`.

## 🔧 Configuração

### Ambiente de Testes

O arquivo `setup.ts` configura o ambiente antes de cada teste:

- Limpa o banco de dados
- Cria períodos padrão (Manhã, Tarde, Noite)
- Cria aulas para cada período (1-5)

### Banco de Dados de Teste

Os testes usam o banco de dados SQLite configurado em `prisma/dev.db`.

## 📝 Notas Importantes

1. **Isolamento:** Cada teste é executado de forma isolada
2. **Limpeza:** O banco é limpo antes de cada suite de testes
3. **Performance:** Os testes de performance têm limites de tempo estritos
4. **Cobertura:** Todos os cenários principais são cobertos

## 🐛 Troubleshooting

### Problemas Comuns

**Erro: "Aula não encontrada"**
- Verifique se o setup está criando as aulas corretamente
- Confirme que o banco de dados foi inicializado

**Erro: "Unique constraint failed"**
- Este erro é esperado em testes de conflitos
- Verifique se o teste está validando corretamente

**Testes lentos**
- Verifique se não há processos em segundo plano
- Confirme que o banco de dados está local

## 📚 Recursos Adicionais

- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Jest Matchers](https://jestjs.io/docs/using-matchers)

## 🤝 Contribuindo

Para adicionar novos testes:

1. Crie um novo bloco `describe` em `reservation.test.ts`
2. Adicione os casos de teste com `it`
3. Execute os testes para validar
4. Atualize esta documentação

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação principal do projeto ou abra uma issue.
