import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.reservation.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.period.deleteMany();
  await prisma.equipment.deleteMany();

  console.log('✅ Dados antigos removidos');

  // Criar períodos
  const manha = await prisma.period.create({
    data: {
      name: 'Manhã',
      order: 1
    }
  });

  const tarde = await prisma.period.create({
    data: {
      name: 'Tarde',
      order: 2
    }
  });

  const noite = await prisma.period.create({
    data: {
      name: 'Noite',
      order: 3
    }
  });

  console.log('✅ 3 períodos criados (Manhã, Tarde, Noite)');

  // Criar aulas para cada período (5 aulas por período)
  const periodos = [manha, tarde, noite];
  
  for (const periodo of periodos) {
    for (let i = 1; i <= 5; i++) {
      await prisma.lesson.create({
        data: {
          periodId: periodo.id,
          lessonNumber: i,
          label: `Aula ${i}`,
          order: i
        }
      });
    }
  }

  console.log('✅ 15 aulas criadas (5 aulas por período)');

  // Inserir equipamentos exemplo
  const equipments = await prisma.equipment.createMany({
    data: [
      {
        name: 'Câmera A',
        description: 'Câmera profissional Sony Alpha'
      },
      {
        name: 'Câmera B',
        description: 'Câmera Canon EOS R5'
      },
      {
        name: 'Microfone 1',
        description: 'Microfone condensador Shure SM7B'
      },
      {
        name: 'Notebook',
        description: 'MacBook Pro 16" para edição'
      },
      {
        name: 'Tripé',
        description: 'Tripé profissional Manfrotto'
      }
    ]
  });

  console.log(`✅ ${equipments.count} equipamentos criados`);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📚 Estrutura criada:');
  console.log('  - 3 Períodos: Manhã, Tarde, Noite');
  console.log('  - 15 Aulas: 5 aulas por período');
  console.log('  - 5 Equipamentos disponíveis');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
