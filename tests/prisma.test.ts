import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/lib/db';

describe('Teste Prisma', () => {
  it('deve conectar ao banco de dados', async () => {
    // Teste simples para verificar se o Prisma está funcionando
    const count = await prisma.equipment.count();
    expect(typeof count).toBe('number');
  });
});
