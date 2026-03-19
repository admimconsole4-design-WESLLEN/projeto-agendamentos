import { prisma } from '../src/lib/db';

// Função para configurar o ambiente de testes
export async function setupTestEnvironment() {
  // Limpar banco de dados de teste antes de executar os testes
  await prisma.reservation.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.period.deleteMany({});
  await prisma.equipment.deleteMany({});

  // Criar períodos padrão
  const manha = await prisma.period.create({
    data: {
      name: 'Manhã',
      order: 1,
    },
  });

  const tarde = await prisma.period.create({
    data: {
      name: 'Tarde',
      order: 2,
    },
  });

  const noite = await prisma.period.create({
    data: {
      name: 'Noite',
      order: 3,
    },
  });

  // Criar aulas para cada período
  for (let i = 1; i <= 5; i++) {
    await prisma.lesson.create({
      data: {
        periodId: manha.id,
        lessonNumber: i,
        label: `Aula ${i}`,
        order: i,
      },
    });

    await prisma.lesson.create({
      data: {
        periodId: tarde.id,
        lessonNumber: i,
        label: `Aula ${i}`,
        order: i,
      },
    });

    await prisma.lesson.create({
      data: {
        periodId: noite.id,
        lessonNumber: i,
        label: `Aula ${i}`,
        order: i,
      },
    });
  }
}

// Função para limpeza após os testes
export async function cleanupTestEnvironment() {
  await prisma.$disconnect();
}
