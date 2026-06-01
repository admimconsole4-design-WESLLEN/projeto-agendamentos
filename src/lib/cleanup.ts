// No modelo baseado em aulas, reservas não expiram por horário.
// Este módulo existe apenas para compatibilidade com server.ts.

export async function cleanupExpiredReservations() {
  return { count: 0, message: 'Nenhuma limpeza necessária' };
}

export function startAutoCleanup() {
  // sem-op no modelo de aulas
}
