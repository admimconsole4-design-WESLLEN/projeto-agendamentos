import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.reservation.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.equipment.deleteMany();

  console.log('✅ Dados antigos removidos');

  // Inserir time slots padrão
  const timeSlots = await prisma.timeSlot.createMany({
    data: [
      {
        startTime: '07:00',
        endTime: '11:20',
        label: 'Manhã'
      },
      {
        startTime: '13:00',
        endTime: '17:00',
        label: 'Tarde'
      },
      {
        startTime: '18:00',
        endTime: '21:00',
        label: 'Noite'
      }
    ]
  });

  console.log(`✅ ${timeSlots.count} time slots criados`);

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
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
