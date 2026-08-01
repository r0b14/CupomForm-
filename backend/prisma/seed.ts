// Seed de campanha provisória para o backend.
import { Prisma, PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const campaign = await prisma.campaign.upsert({
    where: { slug: 'campanha-inicial' },
    update: {},
    create: {
      slug: 'campanha-inicial',
      title: 'Ganhe seu cupom exclusivo',
      subtitle: 'Responda rapidinho e receba seu benefício.',
      privacyText:
        'Autorizo o tratamento dos meus dados para esta campanha, o compartilhamento com o parceiro responsável pela oferta e o envio do cupom pelo WhatsApp.',
    },
  });

  const questions = [
    {
      key: 'interesse',
      label: 'Qual produto mais chama sua atenção?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Novidades', 'Ofertas', 'Atendimento', 'Outro'],
      position: 1,
    },
    {
      key: 'conheceu',
      label: 'Como você conheceu nossa marca?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Indicação', 'Redes sociais', 'Na loja', 'Outro'],
      position: 2,
    },
    {
      key: 'comentario',
      label: 'Quer deixar algum comentário? (opcional)',
      type: QuestionType.TEXT,
      required: false,
      options: Prisma.JsonNull,
      position: 3,
    },
  ];

  for (const question of questions) {
    await prisma.question.upsert({
      where: { campaignId_key: { campaignId: campaign.id, key: question.key } },
      update: question,
      create: { ...question, campaignId: campaign.id },
    });
  }

  const codes = ['BEMVINDO-10', 'BEMVINDO-20', 'BEMVINDO-30'];
  await prisma.coupon.createMany({
    data: codes.map((code) => ({ campaignId: campaign.id, code })),
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
