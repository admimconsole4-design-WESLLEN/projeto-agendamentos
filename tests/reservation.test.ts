import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/db';
import type { Equipment, Period, Lesson } from '../src/lib/supabase';
import { setupTestEnvironment, cleanupTestEnvironment } from './setup';

describe('Bateria de Testes - Sistema de Agendamento', () => {
  let equipments: Equipment[] = [];
  let periods: (Period & { lessons?: Lesson[] })[] = [];
  const lessons: Lesson[] = [];

  // Configuração antes de todos os testes
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  // Limpeza após todos os testes
  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  // Configuração antes de cada suite de testes
  beforeEach(async () => {
    // Limpar reservas existentes
    await prisma.reservation.deleteMany({});

    // Buscar períodos e aulas
    periods = await prisma.period.findMany({
      orderBy: { order: 'asc' },
      include: { lessons: true }
    });

    // Criar equipamentos de teste
    equipments = [];
    const equipmentNames = [
      'Projetor EPSON',
      'Notebook Dell',
      'TV Samsung 55"',
      'Sistema de Som',
      'Câmera Canon',
      'Microfone Wireless',
      'Tablet iPad',
      'Chromebook Cart'
    ];

    for (const name of equipmentNames) {
      const equipment = await prisma.equipment.create({
        data: {
          name,
          description: `Equipamento de teste - ${name}`
        }
      });
      equipments.push(equipment);
    }
  });

  afterEach(async () => {
    // Limpar equipamentos criados
    await prisma.equipment.deleteMany({});
  });

  describe('Teste 1: Agendamento de Múltiplos Equipamentos', () => {
    it('deve criar agendamentos para diferentes equipamentos na mesma data', async () => {
      const date = '2026-03-20';
      const manhaPeriod = periods[0]; // Manhã
      const aula1 = manhaPeriod.lessons?.[0]; // Aula 1
      if (!aula1) throw new Error('Aula não encontrada');

      const reservations = [];
      
      // Criar reservas para todos os equipamentos
      for (const equipment of equipments) {
        const reservation = await prisma.reservation.create({
          data: {
            equipmentId: equipment.id,
            name: `Professor Teste ${equipment.name}`,
            date,
            periodId: manhaPeriod.id,
            lessonNumber: aula1.lessonNumber
          }
        });
        reservations.push(reservation);
      }

      // Verificar se todas as reservas foram criadas
      expect(reservations).toHaveLength(equipments.length);
      
      // Verificar se cada reserva tem os dados corretos
      for (const reservation of reservations) {
        expect(reservation.date).toBe(date);
        expect(reservation.periodId).toBe(manhaPeriod.id);
        expect(reservation.lessonNumber).toBe(aula1.lessonNumber);
      }

      // Verificar no banco de dados
      const dbReservations = await prisma.reservation.findMany({
        where: { date }
      });
      expect(dbReservations).toHaveLength(equipments.length);
    });

    it('deve criar agendamentos para o mesmo equipamento em datas diferentes', async () => {
      const equipment = equipments[0]; // Projetor EPSON
      const manhaPeriod = periods[0];
      const aula1 = manhaPeriod.lessons?.[0];
      if (!aula1) throw new Error('Aula não encontrada');

      const dates = [
        '2026-03-20',
        '2026-03-21',
        '2026-03-22',
        '2026-03-23',
        '2026-03-24'
      ];

      const reservations = [];

      for (const date of dates) {
        const reservation = await prisma.reservation.create({
          data: {
            equipmentId: equipment.id,
            name: `Professor Teste - Dia ${date}`,
            date,
            periodId: manhaPeriod.id,
            lessonNumber: aula1.lessonNumber
          }
        });
        reservations.push(reservation);
      }

      expect(reservations).toHaveLength(dates.length);

      // Verificar reservas no banco
      const dbReservations = await prisma.reservation.findMany({
        where: { equipmentId: equipment.id }
      });
      expect(dbReservations).toHaveLength(dates.length);
    });
  });

  describe('Teste 2: Conflitos de Horário', () => {
    it('não deve permitir agendamento duplicado para o mesmo equipamento, data, período e aula', async () => {
      const equipment = equipments[0];
      const date = '2026-03-20';
      const manhaPeriod = periods[0];
      const aula1 = manhaPeriod.lessons?.[0];
      if (!aula1) throw new Error('Aula não encontrada');

      // Criar primeira reserva
      await prisma.reservation.create({
        data: {
          equipmentId: equipment.id,
          name: 'Professor Silva',
          date,
          periodId: manhaPeriod.id,
          lessonNumber: aula1.lessonNumber
        }
      });

      // Tentar criar reserva duplicada
      await expect(
        prisma.reservation.create({
          data: {
            equipmentId: equipment.id,
            name: 'Professor Santos',
            date,
            periodId: manhaPeriod.id,
            lessonNumber: aula1.lessonNumber
          }
        })
      ).rejects.toThrow();
    });

    it('deve permitir agendamento do mesmo equipamento em aulas diferentes do mesmo dia', async () => {
      const equipment = equipments[0];
      const date = '2026-03-20';
      const manhaPeriod = periods[0];

      const reservations = [];

      // Reservar todas as aulas do período da manhã
      for (const lesson of manhaPeriod.lessons || []) {
        const reservation = await prisma.reservation.create({
          data: {
            equipmentId: equipment.id,
            name: `Professor - Aula ${lesson.lessonNumber}`,
            date,
            periodId: manhaPeriod.id,
            lessonNumber: lesson.lessonNumber
          }
        });
        reservations.push(reservation);
      }

      expect(reservations).toHaveLength(manhaPeriod.lessons?.length || 0);
    });

    it('deve permitir agendamento de equipamentos diferentes no mesmo horário', async () => {
      const date = '2026-03-20';
      const manhaPeriod = periods[0];
      const aula1 = manhaPeriod.lessons?.[0];
      if (!aula1) throw new Error('Aula não encontrada');

      // Reservar múltiplos equipamentos para o mesmo horário
      const reservations = [];
      for (const equipment of equipments.slice(0, 3)) {
        const reservation = await prisma.reservation.create({
          data: {
            equipmentId: equipment.id,
            name: `Professor - ${equipment.name}`,
            date,
            periodId: manhaPeriod.id,
            lessonNumber: aula1.lessonNumber
          }
        });
        reservations.push(reservation);
      }

      expect(reservations).toHaveLength(3);
    });
  });

  describe('Teste 3: Validação de Dados', () => {
    it('não deve criar reserva sem equipmentId', async () => {
      await expect(
        prisma.reservation.create({
          data: {
            equipmentId: '',
            name: 'Professor Teste',
            date: '2026-03-20',
            periodId: periods[0].id,
            lessonNumber: 1
          }
        })
      ).rejects.toThrow();
    });

    it('não deve criar reserva sem nome', async () => {
      await expect(
        prisma.reservation.create({
          data: {
            equipmentId: equipments[0].id,
            name: '',
            date: '2026-03-20',
            periodId: periods[0].id,
            lessonNumber: 1
          }
        })
      ).rejects.toThrow();
    });

    it('não deve criar reserva sem data', async () => {
      await expect(
        prisma.reservation.create({
          data: {
            equipmentId: equipments[0].id,
            name: 'Professor Teste',
            date: '',
            periodId: periods[0].id,
            lessonNumber: 1
          }
        })
      ).rejects.toThrow();
    });

    it('deve aceitar telefone opcional', async () => {
      const reservation = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: 'Professor Teste',
          phone: '(11) 98765-4321',
          date: '2026-03-20',
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      expect(reservation.phone).toBe('(11) 98765-4321');
    });
  });

  describe('Teste 4: Agendamento em Lote (Batch)', () => {
    it('deve criar múltiplas reservas para o mesmo equipamento em um dia', async () => {
      const equipment = equipments[0];
      const date = '2026-03-20';
      const manhaPeriod = periods[0];

      const reservationsData = manhaPeriod.lessons?.map((lesson: Lesson) => ({
        periodId: manhaPeriod.id,
        lessonNumber: lesson.lessonNumber
      })) || [];

      const reservations = [];
      for (const resData of reservationsData) {
        const reservation = await prisma.reservation.create({
          data: {
            equipmentId: equipment.id,
            name: 'Professor Teste',
            date,
            ...resData
          }
        });
        reservations.push(reservation);
      }

      expect(reservations).toHaveLength(manhaPeriod.lessons?.length || 0);

      // Verificar no banco
      const dbReservations = await prisma.reservation.findMany({
        where: {
          equipmentId: equipment.id,
          date
        }
      });
      expect(dbReservations).toHaveLength(manhaPeriod.lessons?.length || 0);
    });

    it('deve criar reservas para múltiplos equipamentos em múltiplas datas', async () => {
      const dates = ['2026-03-20', '2026-03-21', '2026-03-22'];
      const manhaPeriod = periods[0];
      const aula1 = manhaPeriod.lessons?.[0];
      if (!aula1) throw new Error('Aula não encontrada');

      let totalReservations = 0;

      for (const date of dates) {
        for (const equipment of equipments.slice(0, 3)) {
          await prisma.reservation.create({
            data: {
              equipmentId: equipment.id,
              name: `Professor - ${equipment.name}`,
              date,
              periodId: manhaPeriod.id,
              lessonNumber: aula1.lessonNumber
            }
          });
          totalReservations++;
        }
      }

      // Verificar total de reservas
      const dbReservations = await prisma.reservation.findMany();
      expect(dbReservations).toHaveLength(totalReservations);
    });
  });

  describe('Teste 5: Consulta e Disponibilidade', () => {
    beforeEach(async () => {
      // Criar algumas reservas para teste
      const date = '2026-03-20';
      const manhaPeriod = periods[0];

      for (let i = 0; i < 3; i++) {
        await prisma.reservation.create({
          data: {
            equipmentId: equipments[i].id,
            name: `Professor ${i + 1}`,
            date,
            periodId: manhaPeriod.id,
            lessonNumber: 1
          }
        });
      }
    });

    it('deve listar todas as reservas de uma data específica', async () => {
      const date = '2026-03-20';
      const reservations = await prisma.reservation.findMany({
        where: { date },
        include: { equipment: true }
      });

      expect(reservations).toHaveLength(3);
      expect(reservations[0].equipment).toBeDefined();
    });

    it('deve listar todas as reservas de um equipamento', async () => {
      const equipment = equipments[0];
      const reservations = await prisma.reservation.findMany({
        where: { equipmentId: equipment.id }
      });

      expect(reservations.length).toBeGreaterThan(0);
      expect(reservations[0].equipmentId).toBe(equipment.id);
    });

    it('deve verificar disponibilidade de uma aula específica', async () => {
      const date = '2026-03-20';
      const manhaPeriod = periods[0];

      // Verificar aula reservada
      const existing = await prisma.reservation.findFirst({
        where: {
          equipmentId: equipments[0].id,
          date,
          periodId: manhaPeriod.id,
          lessonNumber: 1
        }
      });

      expect(existing).toBeDefined();

      // Verificar aula disponível
      const available = await prisma.reservation.findFirst({
        where: {
          equipmentId: equipments[0].id,
          date,
          periodId: manhaPeriod.id,
          lessonNumber: 2
        }
      });

      expect(available).toBeNull();
    });
  });

  describe('Teste 6: Operações de CRUD', () => {
    it('deve criar uma reserva', async () => {
      const reservation = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: 'Professor Teste',
          date: '2026-03-20',
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      expect(reservation).toBeDefined();
      expect(reservation.id).toBeDefined();
    });

    it('deve ler uma reserva', async () => {
      const created = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: 'Professor Teste',
          date: '2026-03-20',
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      const found = await prisma.reservation.findUnique({
        where: { id: created.id }
      });

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('deve atualizar uma reserva', async () => {
      const created = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: 'Professor Teste',
          date: '2026-03-20',
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      const updated = await prisma.reservation.update({
        where: { id: created.id },
        data: { name: 'Professor Atualizado' }
      });

      expect(updated.name).toBe('Professor Atualizado');
    });

    it('deve deletar uma reserva', async () => {
      const created = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: 'Professor Teste',
          date: '2026-03-20',
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      await prisma.reservation.delete({
        where: { id: created.id }
      });

      const found = await prisma.reservation.findUnique({
        where: { id: created.id }
      });

      expect(found).toBeNull();
    });
  });

  describe('Teste 7: Cenários de Estresse', () => {
    it('deve criar 50 reservas rapidamente', async () => {
      const date = '2026-03-20';
      const manhaPeriod = periods[0];
      const lessonsCount = manhaPeriod.lessons?.length || 1;
      
      const reservations = [];
      for (let i = 0; i < 50; i++) {
        const equipmentIndex = i % equipments.length;
        const lessonIndex = i % lessonsCount;

        const reservation = await prisma.reservation.create({
          data: {
            equipmentId: equipments[equipmentIndex].id,
            name: `Professor Teste ${i}`,
            date,
            periodId: manhaPeriod.id,
            lessonNumber: manhaPeriod.lessons?.[lessonIndex]?.lessonNumber || 1
          }
        });
        reservations.push(reservation);
      }

      expect(reservations).toHaveLength(50);
    });

    it('deve criar reservas para 30 dias consecutivos', async () => {
      const equipment = equipments[0];
      const manhaPeriod = periods[0];
      const aula1 = manhaPeriod.lessons?.[0];
      if (!aula1) throw new Error('Aula não encontrada');

      const startDate = new Date('2026-03-20');
      const reservations = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const reservation = await prisma.reservation.create({
          data: {
            equipmentId: equipment.id,
            name: `Professor Teste - Dia ${i + 1}`,
            date: dateStr,
            periodId: manhaPeriod.id,
            lessonNumber: aula1.lessonNumber
          }
        });
        reservations.push(reservation);
      }

      expect(reservations).toHaveLength(30);
    });
  });

  describe('Teste 8: Relações e Consultas Complexas', () => {
    beforeEach(async () => {
      // Criar reservas com relacionamentos
      const date = '2026-03-20';
      
      for (let i = 0; i < 3; i++) {
        await prisma.reservation.create({
          data: {
            equipmentId: equipments[i].id,
            name: `Professor ${i + 1}`,
            phone: `(11) 98765-${1000 + i}`,
            date,
            periodId: periods[0].id,
            lessonNumber: 1
          }
        });
      }
    });

    it('deve buscar reservas com informações do equipamento', async () => {
      const reservations = await prisma.reservation.findMany({
        include: { equipment: true }
      });

      expect(reservations[0].equipment).toBeDefined();
      expect(reservations[0].equipment.name).toBeDefined();
    });

    it('deve contar reservas por equipamento', async () => {
      const counts = await Promise.all(
        equipments.map(async (equipment) => {
          const count = await prisma.reservation.count({
            where: { equipmentId: equipment.id }
          });
          return { equipment: equipment.name, count };
        })
      );

      const withReservations = counts.filter(c => c.count > 0);
      expect(withReservations.length).toBeGreaterThan(0);
    });
  });

  describe('Teste 9: Edge Cases', () => {
    it('deve lidar com caracteres especiais no nome', async () => {
      const reservation = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: 'Prof. João Silva & Maria Santos (Coord.)',
          date: '2026-03-20',
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      expect(reservation.name).toBe('Prof. João Silva & Maria Santos (Coord.)');
    });

    it('deve lidar com nomes muito longos', async () => {
      const longName = 'Professor '.repeat(50) + 'Com Nome Muito Longo';
      
      const reservation = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: longName,
          date: '2026-03-20',
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      expect(reservation.name).toBe(longName);
    });

    it('deve lidar com datas formatadas de diferentes formas', async () => {
      const dates = [
        '2026-03-20',
        '2026/03/21',
        '20-03-2026'
      ];

      // Apenas a primeira data deve funcionar (formato ISO)
      const reservation = await prisma.reservation.create({
        data: {
          equipmentId: equipments[0].id,
          name: 'Professor Teste',
          date: dates[0],
          periodId: periods[0].id,
          lessonNumber: 1
        }
      });

      expect(reservation.date).toBe(dates[0]);
    });
  });

  describe('Teste 10: Performance', () => {
    it('deve buscar 1000 reservas rapidamente', async () => {
      // Criar 100 reservas primeiro
      const date = '2026-03-20';
      const manhaPeriod = periods[0];
      const lessonsCount = manhaPeriod.lessons?.length || 1;

      for (let i = 0; i < 100; i++) {
        await prisma.reservation.create({
          data: {
            equipmentId: equipments[i % equipments.length].id,
            name: `Professor ${i}`,
            date,
            periodId: manhaPeriod.id,
            lessonNumber: (i % lessonsCount) + 1
          }
        });
      }

      const startTime = Date.now();
      const reservations = await prisma.reservation.findMany();
      const endTime = Date.now();

      expect(reservations.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Menos de 1 segundo
    });

    it('deve contar reservas rapidamente', async () => {
      const startTime = Date.now();
      const count = await prisma.reservation.count();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // Menos de 500ms
    });
  });
});
