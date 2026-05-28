export async function cleanupExpiredReservations() {
  const res = await fetch(process.env.GOOGLE_SCRIPT_URL || '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deleteExpiredReservations' })
  });
  return res.json() as Promise<{ count: number; message: string }>;
}

export function startAutoCleanup(intervalMinutes: number = 5) {
  const intervalMs = intervalMinutes * 60 * 1000;

  cleanupExpiredReservations().then(result => {
    console.log(`[Cleanup] ${result.message}`);
  });

  return setInterval(async () => {
    const result = await cleanupExpiredReservations();
    if (result.count > 0) {
      console.log(`[Cleanup] ${result.message}`);
    }
  }, intervalMs);
}
