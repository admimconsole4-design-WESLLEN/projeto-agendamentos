import express from 'express';
import cors from 'cors';
import path from 'path';
import { prisma } from './src/lib/db.js';
import { startAutoCleanup } from './src/lib/cleanup.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do build
app.use(express.static(path.join(process.cwd(), 'dist')));

// === ROTAS DE EQUIPAMENTOS ===

// Listar todos os equipamentos
app.get('/api/equipments', async (req, res) => {
  try {
    const equipments = await prisma.equipment.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(equipments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Criar equipamento
app.post('/api/equipments', async (req, res) => {
  try {
    const { name, description } = req.body;
    const equipment = await prisma.equipment.create({
      data: { name, description }
    });
    res.json(equipment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar equipamento
app.delete('/api/equipments/:id', async (req, res) => {
  try {
    await prisma.equipment.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === ROTAS DE TIME SLOTS ===

// Listar todos os time slots
app.get('/api/time-slots', async (req, res) => {
  try {
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { startTime: 'asc' }
    });
    res.json(timeSlots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Criar time slot
app.post('/api/time-slots', async (req, res) => {
  try {
    const { startTime, endTime, label } = req.body;
    const timeSlot = await prisma.timeSlot.create({
      data: { startTime, endTime, label }
    });
    res.json(timeSlot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar time slot
app.delete('/api/time-slots/:id', async (req, res) => {
  try {
    await prisma.timeSlot.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === ROTAS DE RESERVAS ===

// Listar reservas (opcionalmente filtradas por data)
app.get('/api/reservations', async (req, res) => {
  try {
    const { date } = req.query;
    const where = date ? { date: String(date) } : undefined;
    
    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      include: {
        equipment: true
      }
    });
    res.json(reservations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Criar reserva
app.post('/api/reservations', async (req, res) => {
  try {
    const { equipmentId, name, date, startTime, endTime } = req.body;
    
    // Verificar conflitos
    const conflicts = await prisma.reservation.findMany({
      where: {
        equipmentId,
        date,
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] }
        ]
      }
    });

    if (conflicts.length > 0) {
      return res.status(400).json({ 
        error: "Este equipamento já está reservado para o horário selecionado" 
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        equipmentId,
        name,
        date,
        startTime,
        endTime
      }
    });
    res.json(reservation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar reserva
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    await prisma.reservation.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar disponibilidade
app.post('/api/check-availability', async (req, res) => {
  try {
    const { equipmentId, date, startTime, endTime } = req.body;
    
    const conflicts = await prisma.reservation.findMany({
      where: {
        equipmentId,
        date,
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] }
        ]
      }
    });

    res.json({ available: conflicts.length === 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SPA fallback - todas as outras rotas retornam o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🌐 Acessível na rede em http://192.168.0.12:${PORT}`);
  
  // Iniciar limpeza automática
  startAutoCleanup(5);
  console.log('🧹 Limpeza automática de reservas expiradas iniciada');
});
