// Seed idempotente da campanha Gente Daqui para desenvolvimento e homologação.
import { Prisma, PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const campaign = await prisma.campaign.upsert({
    where: { slug: 'gente-daqui' },
    update: {
      title: 'Gente Daqui — pesquisa rápida',
      subtitle:
        'Estamos criando um jeito de conectar jovens do bairro a oportunidades reais de trabalho e renda. Para responder leva de 3 a 5 minutinhos. O cupom é só um agrado.',
      privacyText:
        'Autorizo o uso das minhas respostas e do meu WhatsApp para esta pesquisa, para a entrega do cupom e, se eu quiser, para receber informações sobre o piloto Gente Daqui.',
      active: true,
    },
    create: {
      slug: 'gente-daqui',
      title: 'Gente Daqui — pesquisa rápida',
      subtitle:
        'Estamos criando um jeito de conectar jovens do bairro a oportunidades reais de trabalho e renda. Para responder leva de 3 a 5 minutinhos. O cupom é só um agrado.',
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
        'Tenho um trabalho CLT ou PJ',
        'Tenho um negócio',
        'Trabalho por aplicativo',
        'Estou procurando um emprego',
        'Estou estudando',
        'Sou Jovem Aprendiz',
      ],
      position: 3,
    },
    {
      key: 'oportunidade_recente',
      label: 'Nos últimos 6 meses, você ficou sabendo de algum curso, capacitação, vaga ou programa gratuito perto do seu bairro?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Sim, e participei',
        'Sim, mas não participei',
        'Não, mas gostaria de ter participado',
        'Não, nunca fiquei sabendo',
      ],
      position: 4,
    },
    {
      key: 'barreira',
      label: 'O que mais pesa na hora de decidir se vale a pena participar de uma oportunidade?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Não sei se é pra mim',
        'Não confio que vai dar em alguma coisa',
        'Não tenho tempo, preciso trabalhar',
        'É longe da minha residência ou difícil de chegar',
        'Não sabia que existia',
      ],
      position: 5,
    },
    {
      key: 'motivo_participacao',
      label:
        'Se você tivesse acesso a um programa que te conectasse com pessoas do seu bairro que já passaram por processos semelhantes ao que você deseja, qual seria o principal motivo para participar?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Conseguir um emprego formal',
        'Conseguir um emprego informal',
        'Conseguir um estágio',
        'Ter uma renda extra',
        'Aprender algo novo',
        'Ter mais oportunidades',
        'Outro motivo',
      ],
      position: 6,
    },
    {
      key: 'area_interesse',
      label: 'Qual dessas áreas você teria mais vontade de aprender ou trabalhar?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Programação, dados ou inteligência artificial',
        'Suporte técnico e atendimento ao cliente (telefone, chat ou presencial)',
        'Energia solar ou internet e fibra óptica',
        'Trabalho de escritório: administrativo, financeiro, organização de documentos',
        'Marketing digital, redes sociais e vendas pela internet',
        'Beleza, gastronomia ou serviço por conta própria',
        'Audiovisual, música, design, moda ou eventos',
        'Logística, estoque e entregas',
      ],
      position: 7,
    },
    {
      key: 'apoio_primeiro_passo',
      label: 'Pensando na área que você marcou, para dar o primeiro passo, o que mais te ajudaria hoje?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Alguém me explicar o que a pessoa faz no dia a dia e quanto dá pra ganhar',
        'Alguém me mostrar o passo a passo: por onde começar',
        'Alguém me indicar pra uma vaga, um cliente ou uma seleção',
        'Um curso gratuito perto de casa',
        'Um curso que eu faça pelo celular, no meu horário',
        'Alguém acompanhando de perto enquanto eu tento, pra eu não desistir',
      ],
      position: 8,
    },
    {
      key: 'tempo_preparacao',
      label: 'E para isso acontecer, quanto tempo você toparia se preparar antes de começar a ganhar dinheiro nessa área?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: [
        'Só topo se der pra ganhar alguma coisa desde o começo',
        'Até 1 mês',
        'De 3 a 6 meses',
        'Mais de 6 meses, se eu tiver certeza de que vale a pena',
        'Hoje eu não teria como parar pra estudar',
      ],
      position: 9,
    },
    {
      key: 'referencia_local',
      label: 'Você conhece alguém do seu bairro que conseguiu um emprego bom, formalizou o próprio negócio ou entrou numa formação que valeu a pena?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Sim, conheço bem essa pessoa', 'Conheço de vista, mas não converso', 'Não conheço ninguém assim'],
      position: 10,
    },
    {
      key: 'referencia_nome_profissao',
      label: 'Se você tem alguém como referência, qual é o nome ou apelido dessa pessoa e em que profissão ou área ela trabalha?',
      type: QuestionType.TEXT,
      required: false,
      options: Prisma.JsonNull,
      position: 11,
    },
    {
      key: 'confianca_programa',
      label: 'Quanto você confiaria em um programa que te conecta com alguém do seu bairro para ajudar nos próximos passos profissionais?',
      type: QuestionType.SCALE,
      required: true,
      options: ['1 - Nada', '2', '3', '4', '5 - Muita confiança'],
      position: 12,
    },
    {
      key: 'sentido_para_vida',
      label: 'Quanto a ideia do Gente Daqui faz sentido para sua vida?',
      type: QuestionType.SCALE,
      required: true,
      options: ['1 - Nada a ver', '2', '3', '4', '5 - Faz muito sentido'],
      position: 13,
    },
    {
      key: 'participaria',
      label: 'Se esse programa existisse, você participaria?',
      type: QuestionType.SINGLE_CHOICE,
      required: true,
      options: ['Sim, com certeza', 'Talvez, depende de como funciona', 'Não, não é pra mim'],
      position: 14,
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
      position: 15,
    },
    {
      key: 'motivo_desistencia',
      label: 'Em uma frase: o que faria você desistir de continuar em um programa assim?',
      type: QuestionType.TEXT,
      required: false,
      options: Prisma.JsonNull,
      position: 16,
    },
  ];

  await prisma.$transaction(async (tx) => {
    // As posições são únicas por campanha. Deslocá-las temporariamente evita
    // colisões ao inserir perguntas no meio da sequência já publicada.
    await tx.question.updateMany({
      where: { campaignId: campaign.id },
      data: { position: { increment: questions.length } },
    });

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
  // a ausência da variável é o que impede cupons demonstrativos de chegarem a participantes.
  if (process.env.SEED_DEV_COUPONS === 'true') {
    const codes = [
      'GENTE-005-DEV-001',
      'GENTE-005-DEV-002',
      'GENTE-010-DEV-001',
      'GENTE-010-DEV-002',
    ];
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
