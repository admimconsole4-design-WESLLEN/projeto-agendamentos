import { prisma } from './db';

/**
 * Remove reservas que já passaram da data
 * Reservas são consideradas expiradas quando a data é anterior a hoje
 */
export async function cleanupExpiredReservations() {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD

  const result = await prisma.reservation.deleteMany({
    where: {
      date: {
        lt: today
      }
    }
  });

  return {
    count: result.count,
    message: result.count > 0 
      ? `${result.count} reserva(s) expirada(s) removida(s)`
      : 'Nenhuma reserva expirada encontrada'
  };
}

/**
 * Inicia o cleanup automático que executa a cada 5 minutos
 */
export function startAutoCleanup(intervalMinutes: number = 5) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Executa imediatamente na inicialização
  cleanupExpiredReservations().then(result => {
    console.log(`[Cleanup] ${result.message}`);
  });

  // Executa periodicamente
  const intervalId = setInterval(async () => {
    const result = await cleanupExpiredReservations();
    if (result.count > 0) {
      console.log(`[Cleanup] ${result.message}`);
    }
  }, intervalMs);

  return intervalId;
}
