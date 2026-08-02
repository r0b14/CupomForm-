import { Campaign } from "./types";

// Mirrors backend/prisma/seed.ts 1:1 so `?preview=1` exercises the real
// question set (keys, types, options) without depending on the backend.
export const previewCampaign: Campaign = {
  slug: "gente-daqui-preview",
  title: "Gente Daqui — pesquisa rápida",
  subtitle:
    "Estamos criando um jeito de conectar jovens do bairro a oportunidades reais de trabalho e renda. Para responder leva de 3 a 5 minutinhos. O cupom é só um agrado.",
  privacyText:
    "Autorizo o uso das minhas respostas e do meu WhatsApp para esta pesquisa, para a entrega do cupom e, se eu quiser, para receber informações sobre o piloto Gente Daqui.",
  questions: [
    {
      key: "idade",
      label: "Qual é a sua idade?",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["Menos de 18", "18 a 20", "21 a 24", "25 a 29", "30 ou mais"],
    },
    {
      key: "bairro",
      label: "Em qual bairro você mora?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Joana Bezerra (Coque)",
        "Afogados",
        "Madalena",
        "San Martin",
        "Mangueira",
        "Jiquiá",
        "Torre",
        "São José",
        "Santo Amaro",
        "Outro",
      ],
    },
    {
      key: "situacao_atual",
      label: "Hoje, qual dessas frases mais combina com você?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Tenho um trabalho CLT ou PJ",
        "Tenho um negócio",
        "Trabalho por aplicativo",
        "Estou procurando um emprego",
        "Estou estudando",
        "Sou Jovem Aprendiz",
      ],
    },
    {
      key: "oportunidade_recente",
      label:
        "Nos últimos 6 meses, você ficou sabendo de algum curso, capacitação, vaga ou programa gratuito perto do seu bairro?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Sim, e participei",
        "Sim, mas não participei",
        "Não, mas gostaria de ter participado",
        "Não, nunca fiquei sabendo",
      ],
    },
    {
      key: "barreira",
      label:
        "O que mais pesa na hora de decidir se vale a pena participar de uma oportunidade?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Não sei se é pra mim",
        "Não confio que vai dar em alguma coisa",
        "Não tenho tempo, preciso trabalhar",
        "É longe da minha residência ou difícil de chegar",
        "Não sabia que existia",
      ],
    },
    {
      key: "motivo_participacao",
      label:
        "Se você tivesse acesso a um programa que te conectasse com pessoas do seu bairro que já passaram por processos semelhantes ao que você deseja, qual seria o principal motivo para participar?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Conseguir um emprego formal",
        "Conseguir um emprego informal",
        "Conseguir um estágio",
        "Ter uma renda extra",
        "Aprender algo novo",
        "Ter mais oportunidades",
        "Outro motivo",
      ],
    },
    {
      key: "area_interesse",
      label: "Qual dessas áreas você teria mais vontade de aprender ou trabalhar?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Programação, dados ou inteligência artificial",
        "Suporte técnico e atendimento ao cliente (telefone, chat ou presencial)",
        "Energia solar ou internet e fibra óptica",
        "Trabalho de escritório: administrativo, financeiro, organização de documentos",
        "Marketing digital, redes sociais e vendas pela internet",
        "Beleza, gastronomia ou serviço por conta própria",
        "Audiovisual, música, design, moda ou eventos",
        "Logística, estoque e entregas",
      ],
    },
    {
      key: "apoio_primeiro_passo",
      label:
        "Pensando na área que você marcou, para dar o primeiro passo, o que mais te ajudaria hoje?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Alguém me explicar o que a pessoa faz no dia a dia e quanto dá pra ganhar",
        "Alguém me mostrar o passo a passo: por onde começar",
        "Alguém me indicar pra uma vaga, um cliente ou uma seleção",
        "Um curso gratuito perto de casa",
        "Um curso que eu faça pelo celular, no meu horário",
        "Alguém acompanhando de perto enquanto eu tento, pra eu não desistir",
      ],
    },
    {
      key: "tempo_preparacao",
      label:
        "E para isso acontecer, quanto tempo você toparia se preparar antes de começar a ganhar dinheiro nessa área?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Só topo se der pra ganhar alguma coisa desde o começo",
        "Até 1 mês",
        "De 3 a 6 meses",
        "Mais de 6 meses, se eu tiver certeza de que vale a pena",
        "Hoje eu não teria como parar pra estudar",
      ],
    },
    {
      key: "referencia_local",
      label:
        "Você conhece alguém do seu bairro que conseguiu um emprego bom, formalizou o próprio negócio ou entrou numa formação que valeu a pena?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Sim, conheço bem essa pessoa",
        "Conheço de vista, mas não converso",
        "Não conheço ninguém assim",
      ],
    },
    {
      key: "referencia_nome_profissao",
      label:
        "Se você tem alguém como referência, qual é o nome ou apelido dessa pessoa e em que profissão ou área ela trabalha?",
      type: "TEXT",
      required: false,
      options: null,
    },
    {
      key: "confianca_programa",
      label:
        "Quanto você confiaria em um programa que te conecta com alguém do seu bairro para ajudar nos próximos passos profissionais?",
      type: "SCALE",
      required: true,
      options: ["1 - Nada", "2", "3", "4", "5 - Muita confiança"],
    },
    {
      key: "sentido_para_vida",
      label: "Quanto a ideia do Gente Daqui faz sentido para sua vida?",
      type: "SCALE",
      required: true,
      options: ["1 - Nada a ver", "2", "3", "4", "5 - Faz muito sentido"],
    },
    {
      key: "participaria",
      label: "Se esse programa existisse, você participaria?",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["Sim, com certeza", "Talvez, depende de como funciona", "Não, não é pra mim"],
    },
    {
      key: "canal_acompanhamento",
      label: "Qual seria o melhor jeito de te acompanhar no dia a dia?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "WhatsApp (conversa direta)",
        "Grupo de WhatsApp com outras pessoas",
        "Aplicativo ou fórum separado",
        "Encontro presencial no COMPAZ",
        "Outro",
      ],
    },
    {
      key: "motivo_desistencia",
      label: "Em uma frase: o que faria você desistir de continuar em um programa assim?",
      type: "TEXT",
      required: false,
      options: null,
    },
  ],
};
