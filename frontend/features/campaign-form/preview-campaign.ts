import { Campaign } from "./types";

// Mirrors backend/prisma/seed.ts 1:1 so `?preview=1` exercises the real
// question set (keys, types, options) without depending on the backend.
export const previewCampaign: Campaign = {
  slug: "gente-daqui-preview",
  title: "Gente Daqui — pesquisa rápida",
  subtitle:
    "Estamos criando um jeito de conectar jovens do bairro a oportunidades reais de trabalho e renda. Leva de 3 a 5 minutinhos.",
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
        "Já tenho meu próprio trabalho ou negócio",
        "Trabalho por aplicativo",
        "Estou procurando emprego ou uma oportunidade",
        "Estou estudando",
        "Nenhuma dessas",
      ],
    },
    {
      key: "oportunidade_recente",
      label:
        "Nos últimos 12 meses, você ficou sabendo de algum curso, vaga ou programa gratuito perto de você?",
      type: "SINGLE_CHOICE",
      required: true,
      options: ["Sim, e participei", "Sim, mas não participei", "Não, nunca fiquei sabendo"],
    },
    {
      key: "barreira",
      label:
        "O que mais pesa na hora de decidir se vale a pena participar de uma oportunidade?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Não tenho tempo, preciso trabalhar",
        "Não sei se é pra mim",
        "Não confio que vai dar em alguma coisa",
        "É longe ou difícil de chegar",
        "Não sabia que existia",
        "Outro motivo",
      ],
    },
    {
      key: "mensageiro_confiavel",
      label: "Quem te deixaria mais à vontade para conhecer uma oportunidade?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Uma pessoa conhecida do bairro que já passou por isso",
        "Um cartaz ou anúncio",
        "Uma mensagem de WhatsApp de um número que eu não conheço",
        "Um post em rede social",
        "Alguém da prefeitura ou de um programa que eu não conheço",
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
      key: "confianca_programa",
      label:
        "Quanto você confiaria em um programa que te conecta com alguém do seu bairro para ajudar nos próximos passos?",
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
