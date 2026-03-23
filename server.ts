import express from 'express';
import cors from 'cors';
import path from 'path';
import { prisma } from './src/lib/db.js';
import { startAutoCleanup } from './src/lib/cleanup.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Configuração CORS para permitir acesso do ngrok
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3001',
    'http://192.168.0.19:5173',
    'http://192.168.0.19:8080',
    'http://192.168.0.19:8081',
    'http://192.168.0.19:3001',
    'http://192.168.0.12:5173',
    'http://192.168.0.12:8080',
    'http://192.168.0.12:8081',
    'http://192.168.0.12:3001',
    'https://nonlogistical-krishna-ontogenetical.ngrok-free.dev'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// === ROTAS DE PERÍODOS ===

// Listar todos os períodos
app.get('/api/periods', async (req, res) => {
  try {
    const periods = await prisma.period.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });
    res.json(periods);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// === ROTAS DE AULAS ===

// Listar todas as aulas
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      orderBy: { order: 'asc' },
      include: {
        period: true
      }
    });
    res.json(lessons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Listar aulas de um período específico
app.get('/api/lessons/period/:periodId', async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { periodId: req.params.periodId },
      orderBy: { order: 'asc' }
    });
    res.json(lessons);
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
        { periodId: 'asc' },
        { lessonNumber: 'asc' }
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
    const { equipmentId, name, date, periodId, lessonNumber } = req.body;
    
    // Verificar se já existe reserva para esta aula
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        equipmentId,
        date,
        periodId,
        lessonNumber
      }
    });

    if (existingReservation) {
      return res.status(400).json({ 
        error: "Esta aula já está reservada para este equipamento" 
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        equipmentId,
        name,
        date,
        periodId,
        lessonNumber
      }
    });
    res.json(reservation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Criar múltiplas reservas (várias aulas de uma vez)
app.post('/api/reservations/batch', async (req, res) => {
  try {
    const { equipmentId, name, date, reservations } = req.body;
    
    // reservations é um array de { periodId, lessonNumber }
    const createdReservations = [];
    const errors = [];

    for (const reservationData of reservations) {
      try {
        // Verificar se já existe
        const existing = await prisma.reservation.findFirst({
          where: {
            equipmentId,
            date,
            periodId: reservationData.periodId,
            lessonNumber: reservationData.lessonNumber
          }
        });

        if (existing) {
          errors.push({
            ...reservationData,
            error: 'Aula já reservada'
          });
          continue;
        }

        const reservation = await prisma.reservation.create({
          data: {
            equipmentId,
            name,
            date,
            periodId: reservationData.periodId,
            lessonNumber: reservationData.lessonNumber
          }
        });

        createdReservations.push(reservation);
      } catch (err: any) {
        errors.push({
          ...reservationData,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      created: createdReservations,
      errors
    });
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

// Verificar disponibilidade de uma aula específica
app.post('/api/check-availability', async (req, res) => {
  try {
    const { equipmentId, date, periodId, lessonNumber } = req.body;
    
    const existing = await prisma.reservation.findFirst({
      where: {
        equipmentId,
        date,
        periodId,
        lessonNumber
      }
    });

    res.json({ available: !existing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SPA fallback - todas as outras rotas retornam o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🌐 Acessível na rede em http://192.168.0.12:${PORT}`);
  
  // Iniciar limpeza automática
  startAutoCleanup(5);
  console.log('🧹 Limpeza automática de reservas expiradas iniciada');
});
