#!/usr/bin/env tsx

/**
 * Script para executar a bateria completa de testes do sistema de agendamento
 * Este script executa todos os testes e gera um relatório detalhado
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   BATERIA DE TESTES - SISTEMA DE AGENDAMENTO              ║');
console.log('║   Sistema de Reserva de Equipamentos Escolares            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

interface TestSuite {
  name: string;
  status: 'passed' | 'failed';
  duration: number;
}

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  duration: 0,
  suites: [] as TestSuite[]
};

function runTest(testName: string, command: string): boolean {
  console.log(`\n📋 Executando: ${testName}`);
  console.log('─'.repeat(60));
  
  try {
    const startTime = Date.now();
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ ${testName} - PASSOU (${duration}ms)`);
    testResults.suites.push({
      name: testName,
      status: 'passed',
      duration
    });
    testResults.passed++;
    testResults.total++;
    return true;
  } catch (error: unknown) {
    const duration = (error as { status?: number })?.status || 0;
    console.log(`\n❌ ${testName} - FALHOU`);
    testResults.suites.push({
      name: testName,
      status: 'failed',
      duration
    });
    testResults.failed++;
    testResults.total++;
    return false;
  }
}

function printSummary() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      RESUMO FINAL                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📊 Total de Testes: ${testResults.total}`);
  console.log(`✅ Passou: ${testResults.passed}`);
  console.log(`❌ Falhou: ${testResults.failed}`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM - VERIFIQUE OS LOGS ACIMA');
  }
  
  console.log('\n📋 Detalhes por Suite:');
  testResults.suites.forEach(suite => {
    const icon = suite.status === 'passed' ? '✅' : '❌';
    console.log(`  ${icon} ${suite.name} (${suite.duration}ms)`);
  });
  
  console.log('\n' + '═'.repeat(60));
}

// Executar os testes
console.log('🚀 Iniciando execução da bateria de testes...\n');

// Teste 1: Agendamento de Múltiplos Equipamentos
runTest(
  'Teste 1: Agendamento de Múltiplos Equipamentos',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 1"'
);

// Teste 2: Conflitos de Horário
runTest(
  'Teste 2: Conflitos de Horário',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 2"'
);

// Teste 3: Validação de Dados
runTest(
  'Teste 3: Validação de Dados',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 3"'
);

// Teste 4: Agendamento em Lote
runTest(
  'Teste 4: Agendamento em Lote (Batch)',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 4"'
);

// Teste 5: Consulta e Disponibilidade
runTest(
  'Teste 5: Consulta e Disponibilidade',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 5"'
);

// Teste 6: Operações de CRUD
runTest(
  'Teste 6: Operações de CRUD',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 6"'
);

// Teste 7: Cenários de Estresse
runTest(
  'Teste 7: Cenários de Estresse',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 7"'
);

// Teste 8: Relações e Consultas Complexas
runTest(
  'Teste 8: Relações e Consultas Complexas',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 8"'
);

// Teste 9: Edge Cases
runTest(
  'Teste 9: Edge Cases',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 9"'
);

// Teste 10: Performance
runTest(
  'Teste 10: Performance',
  'npm run test:run -- tests/reservation.test.ts -t "Teste 10"'
);

// Executar todos os testes de uma vez para verificar integração
console.log('\n🔄 Executando todos os testes juntos (verificação de integração)...');
runTest(
  'Todos os Testes (Integração)',
  'npm run test:run -- tests/reservation.test.ts'
);

// Imprimir resumo final
printSummary();

// Salvar relatório em JSON
const reportPath = path.join(process.cwd(), 'test-report.json');
fs.writeFileSync(
  reportPath,
  JSON.stringify(testResults, null, 2)
);
console.log(`\n📄 Relatório salvo em: ${reportPath}`);

// Exit com código apropriado
process.exit(testResults.failed > 0 ? 1 : 0);
