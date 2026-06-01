try { process.loadEnvFile('.env'); } catch { /* sem .env em produção, variáveis vêm do ambiente */ }

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { startAutoCleanup } from './src/lib/cleanup.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'dist')));

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

type DbRow = Record<string, unknown>;

function toEquipment(row: DbRow) {
  return {
    id: row.id,
    name: row.name,
    description: (row.description as string | null) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toLesson(row: DbRow) {
  return {
    id: row.id,
    periodId: row.period_id,
    lessonNumber: row.lesson_number,
    label: row.label,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPeriod(row: DbRow) {
  return {
    id: row.id,
    name: row.name,
    order: row.order,
    lessons: ((row.lessons as DbRow[]) ?? []).map(toLesson),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toReservation(row: DbRow) {
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    name: row.name,
    phone: (row.phone as string | null) ?? null,
    date: row.date,
    periodId: row.period_id,
    lessonNumber: row.lesson_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// === EQUIPAMENTOS ===

app.get('/api/equipments', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json(data.map(toEquipment));
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

app.post('/api/equipments', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const { data, error } = await supabase
      .from('equipments')
      .insert({ name, description: description || null })
      .select()
      .single();
    if (error) throw error;
    res.json(toEquipment(data));
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

app.delete('/api/equipments/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('equipments')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

// === PERÍODOS ===

app.get('/api/periods', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('periods')
      .select('*, lessons(*)')
      .order('order')
      .order('order', { referencedTable: 'lessons' });
    if (error) throw error;
    res.json(data.map(toPeriod));
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

// === AULAS ===

app.get('/api/lessons', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('order');
    if (error) throw error;
    res.json(data.map(toLesson));
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

app.get('/api/lessons/period/:periodId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('period_id', req.params.periodId)
      .order('order');
    if (error) throw error;
    res.json(data.map(toLesson));
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

// === RESERVAS ===

app.get('/api/reservations', async (req, res) => {
  try {
    let query = supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (req.query.date) {
      query = query.eq('date', String(req.query.date));
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data.map(toReservation));
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { equipmentId, name, date, periodId, lessonNumber } = req.body;
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        equipment_id: equipmentId,
        name,
        date,
        period_id: periodId,
        lesson_number: lessonNumber,
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Esta aula já está reservada para este equipamento' });
      }
      throw error;
    }
    res.json(toReservation(data));
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

app.post('/api/reservations/batch', async (req, res) => {
  try {
    const { equipmentId, name, date, reservations } = req.body;

    // Busca todas as reservas existentes para este equipamento nesta data
    type ReservationSlot = { periodId: string; lessonNumber: number };

    const { data: existing } = await supabase
      .from('reservations')
      .select('period_id, lesson_number')
      .eq('equipment_id', equipmentId)
      .eq('date', date);

    const conflictSet = new Set(
      (existing ?? []).map((r: DbRow) => `${r.period_id}-${r.lesson_number}`)
    );

    const toInsert = (reservations as ReservationSlot[]).filter(
      (r) => !conflictSet.has(`${r.periodId}-${r.lessonNumber}`)
    );
    const errors = (reservations as ReservationSlot[]).filter(
      (r) => conflictSet.has(`${r.periodId}-${r.lessonNumber}`)
    );

    let created: DbRow[] = [];
    if (toInsert.length > 0) {
      const { data, error } = await supabase
        .from('reservations')
        .insert(
          toInsert.map((r) => ({
            equipment_id: equipmentId,
            name,
            date,
            period_id: r.periodId,
            lesson_number: r.lessonNumber,
          }))
        )
        .select();
      if (error) throw error;
      created = (data ?? []).map((r) => toReservation(r as DbRow));
    }

    res.json({ success: true, created, errors });
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ error: errMsg(error) });
  }
});

app.post('/api/check-availability', async (req, res) => {
  try {
    const { equipmentId, date, periodId, lessonNumber } = req.body;
    const { data } = await supabase
      .from('reservations')
      .select('id')
      .eq('equipment_id', equipmentId)
      .eq('date', date)
      .eq('period_id', periodId)
      .eq('lesson_number', lessonNumber)
      .maybeSingle();
    res.json({ available: !data });
  } catch {
    res.json({ available: true });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Acessível na rede em http://192.168.0.12:${PORT}`);
  startAutoCleanup();
});
