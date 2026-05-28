process.loadEnvFile('.env');

import express from 'express';
import cors from 'cors';
import path from 'path';
import { startAutoCleanup } from './src/lib/cleanup.js';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'dist')));

async function scriptGet(action: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(process.env.GOOGLE_SCRIPT_URL || '');
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

async function scriptPost(action: string, body: Record<string, any> = {}): Promise<any> {
  const res = await fetch(process.env.GOOGLE_SCRIPT_URL || '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body })
  });
  return res.json();
}

// === EQUIPAMENTOS ===

app.get('/api/equipments', async (_req, res) => {
  try {
    res.json(await scriptGet('equipments'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/equipments', async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = await scriptPost('createEquipment', { name, description });
    if (data.error) return res.status(400).json(data);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/equipments/:id', async (req, res) => {
  try {
    res.json(await scriptPost('deleteEquipment', { id: req.params.id }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === PERÍODOS ===

app.get('/api/periods', async (_req, res) => {
  try {
    res.json(await scriptGet('periods'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === AULAS ===

app.get('/api/lessons', async (_req, res) => {
  try {
    res.json(await scriptGet('lessons'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lessons/period/:periodId', async (req, res) => {
  try {
    res.json(await scriptGet('lessons', { periodId: req.params.periodId }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === RESERVAS ===

app.get('/api/reservations', async (req, res) => {
  try {
    const params: Record<string, string> = {};
    if (req.query.date) params.date = String(req.query.date);
    res.json(await scriptGet('reservations', params));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { equipmentId, name, date, periodId, lessonNumber } = req.body;
    const data = await scriptPost('createReservation', { equipmentId, name, date, periodId, lessonNumber });
    if (data.error) return res.status(400).json(data);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reservations/batch', async (req, res) => {
  try {
    const { equipmentId, name, date, reservations } = req.body;
    res.json(await scriptPost('createReservationBatch', { equipmentId, name, date, reservations }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    res.json(await scriptPost('deleteReservation', { id: req.params.id }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/check-availability', async (req, res) => {
  try {
    const { equipmentId, date, periodId, lessonNumber } = req.body;
    res.json(await scriptPost('checkAvailability', { equipmentId, date, periodId, lessonNumber }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Acessível na rede em http://192.168.0.12:${PORT}`);
  startAutoCleanup(5);
  console.log('Limpeza automática de reservas expiradas iniciada');
});
