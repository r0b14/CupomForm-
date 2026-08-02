// Seed idempotente da campanha Gente Daqui para desenvolvimento e homologação.
import { Prisma, PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const campaign = await prisma.campaign.upsert({
    where: { slug: 'gente-daqui' },
    update: {
      title: 'Gente Daqui — pesquisa rápida',
      subtitle:
        'Estamos criando um jeito de conectar jovens do bairro a oportunidades reais de trabalho e renda. Leva de 3 a 5 minutinhos.',
      privacyText:
        'Autorizo o uso das minhas respostas e do meu WhatsApp para esta pesquisa, para a entrega do cupom e, se eu quiser, para receber informações sobre o piloto Gente Daqui.',
      active: true,
    },
    create: {
      slug: 'gente-daqui',
      title: 'Gente Daqui — pesquisa rápida',
      subtitle:
        'Estamos criando um jeito de conectar jovens do bairro a oportunidades reais de trabalho e renda. Leva de 3 a 5 minutinhos.',
      privacyText:
        'Autorizo o uso das minhas respostas e do meu WhatsApp para esta pesquisa, para a entrega do cupom e, se eu quiser, para receber informações sobre o piloto Gente Daqui.',
    },
  });

  await prisma.campaign.updateMany({
    where: { id: { not: campaign.id }, active: true },
    data: { active: false },
  });

  const questions = [
    {
      key: 'idade',
      label: 'Qual é a sua idade?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Menos de 18', '18 a 20', '21 a 24', '25 a 29', '30 ou mais'],
      position: 1,
    },
    {
      key: 'bairro',
      label: 'Em qual bairro você mora?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Joana Bezerra (Coque)',
        'Afogados',
        'Madalena',
        'San Martin',
        'Mangueira',
        'Jiquiá',
        'Torre',
        'São José',
        'Santo Amaro',
        'Outro',
      ],
      position: 2,
    },
    {
      key: 'situacao_atual',
      label: 'Hoje, qual dessas frases mais combina com você?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Já tenho meu próprio trabalho ou negócio',
        'Trabalho por aplicativo',
        'Estou procurando emprego ou uma oportunidade',
        'Estou estudando',
        'Nenhuma dessas',
      ],
      position: 3,
    },
    {
      key: 'oportunidade_recente',
      label: 'Nos últimos 12 meses, você ficou sabendo de algum curso, vaga ou programa gratuito perto de você?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Sim, e participei', 'Sim, mas não participei', 'Não, nunca fiquei sabendo'],
      position: 4,
    },
    {
      key: 'barreira',
      label: 'O que mais pesa na hora de decidir se vale a pena participar de uma oportunidade?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Não tenho tempo, preciso trabalhar',
        'Não sei se é pra mim',
        'Não confio que vai dar em alguma coisa',
        'É longe ou difícil de chegar',
        'Não sabia que existia',
        'Outro motivo',
      ],
      position: 5,
    },
    {
      key: 'mensageiro_confiavel',
      label: 'Quem te deixaria mais à vontade para conhecer uma oportunidade?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Uma pessoa conhecida do bairro que já passou por isso',
        'Um cartaz ou anúncio',
        'Uma mensagem de WhatsApp de um número que eu não conheço',
        'Um post em rede social',
        'Alguém da prefeitura ou de um programa que eu não conheço',
      ],
      position: 6,
    },
    {
      key: 'referencia_local',
      label: 'Você conhece alguém do seu bairro que conseguiu um emprego bom, formalizou o próprio negócio ou entrou numa formação que valeu a pena?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Sim, conheço bem essa pessoa', 'Conheço de vista, mas não converso', 'Não conheço ninguém assim'],
      position: 7,
    },
    {
      key: 'confianca_programa',
      label: 'Quanto você confiaria em um programa que te conecta com alguém do seu bairro para ajudar nos próximos passos?',
      type: QuestionType.SCALE,
      required: true,
      options: ['1 - Nada', '2', '3', '4', '5 - Muita confiança'],
      position: 8,
    },
    {
      key: 'sentido_para_vida',
      label: 'Quanto a ideia do Gente Daqui faz sentido para sua vida?',
      type: QuestionType.SCALE,
      required: true,
      options: ['1 - Nada a ver', '2', '3', '4', '5 - Faz muito sentido'],
      position: 9,
    },
    {
      key: 'participaria',
      label: 'Se esse programa existisse, você participaria?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Sim, com certeza', 'Talvez, depende de como funciona', 'Não, não é pra mim'],
      position: 10,
    },
    {
      key: 'canal_acompanhamento',
      label: 'Qual seria o melhor jeito de te acompanhar no dia a dia?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'WhatsApp (conversa direta)',
        'Grupo de WhatsApp com outras pessoas',
        'Aplicativo ou fórum separado',
        'Encontro presencial no COMPAZ',
        'Outro',
      ],
      position: 11,
    },
    {
      key: 'motivo_desistencia',
      label: 'Em uma frase: o que faria você desistir de continuar em um programa assim?',
      type: QuestionType.TEXT,
      required: false,
      options: Prisma.JsonNull,
      position: 12,
    },
  ];

  await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany({
      where: {
        campaignId: campaign.id,
        key: { notIn: questions.map((question) => question.key) },
      },
    });

    for (const question of questions) {
      await tx.question.upsert({
        where: { campaignId_key: { campaignId: campaign.id, key: question.key } },
        update: question,
        create: { ...question, campaignId: campaign.id },
      });
    }
  });

  // Cupons de teste só entram em ambientes não produtivos. Em produção os códigos
  // reais são carregados pelo painel admin (POST /api/admin/coupons/import), então
  // a ausência da variável é o que impede um GENTE-DEV-* de chegar a um participante.
  if (process.env.SEED_DEV_COUPONS === 'true') {
    const codes = ['GENTE-DEV-001', 'GENTE-DEV-002', 'GENTE-DEV-003'];
    await prisma.coupon.createMany({
      data: codes.map((code) => ({ campaignId: campaign.id, code })),
      skipDuplicates: true,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
