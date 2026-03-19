import { describe, it, expect } from 'vitest';

describe('Teste Simples', () => {
  it('deve somar dois números', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });

  it('deve verificar se é verdadeiro', () => {
    expect(true).toBe(true);
  });
});
