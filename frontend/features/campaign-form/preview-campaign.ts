import { Campaign, Question } from "./types";

const single = (
  key: string,
  label: string,
  options: string[],
  section: number,
): Question => ({ key, label, type: "SINGLE_CHOICE", required: true, options, maxSelections: null, section });

const multiple = (
  key: string,
  label: string,
  options: string[],
  maxSelections: number,
  section: number,
): Question => ({ key, label, type: "MULTIPLE_CHOICE", required: true, options, maxSelections, section });

const text = (key: string, label: string, section: number): Question => ({
  key,
  label,
  type: "TEXT",
  required: false,
  options: null,
  maxSelections: null,
  section,
});

const scale = (key: string, label: string, options: string[], section: number): Question => ({
  key,
  label,
  type: "SCALE",
  required: true,
  options,
  maxSelections: null,
  section,
});

export const previewCampaign: Campaign = {
  slug: "gente-daqui-preview",
  title: "Gente Daqui — pesquisa rápida",
  subtitle:
    "Estamos criando um jeito de conectar jovens do bairro a oportunidades reais de trabalho e renda. Para responder leva de 3 a 5 minutinhos. O cupom é só um agrado.",
  privacyText:
    "Autorizo o uso das minhas respostas e do meu WhatsApp para esta pesquisa, para a entrega do cupom e, se eu quiser, para receber informações sobre o piloto Gente Daqui.",
  questions: [
    single("idade", "Qual é a sua idade?", ["Menos de 18", "18 a 20", "21 a 24", "25 a 29", "30 ou mais"], 2),
    single("bairro", "Em qual bairro você mora?", ["Joana Bezerra (Coque)", "Afogados", "Madalena", "San Martin", "Mangueira", "Jiquiá", "Torre", "São José", "Santo Amaro", "Outro"], 1),
    single("situacao_atual", "Hoje, qual dessas frases mais combina com você?", ["Tenho um trabalho CLT ou PJ", "Tenho um negócio", "Trabalho por aplicativo", "Estou procurando um emprego", "Estou estudando", "Sou Jovem Aprendiz"], 2),
    single("oportunidade_recente", "Nos últimos 6 meses, você ficou sabendo de algum curso, capacitação, vaga ou programa gratuito perto do seu bairro?", ["Sim, e participei", "Sim, mas não participei", "Não, mas gostaria de ter participado", "Não, nunca fiquei sabendo"], 2),
    single("barreira", "O que mais pesa na hora de decidir se vale a pena participar de uma oportunidade?", ["Não sei se é pra mim", "Não confio que vai dar em alguma coisa", "Não tenho tempo, preciso trabalhar", "É longe da minha residência ou difícil de chegar", "Não sabia que existia"], 2),
    multiple("motivo_participacao", "O que você mais gostaria de conquistar com um programa de apoio profissional no seu bairro?", ["Conseguir um emprego formal", "Conseguir um emprego informal", "Conseguir um estágio", "Ter uma renda extra", "Aprender algo novo", "Ter mais oportunidades", "Outro motivo"], 3, 3),
    multiple("area_interesse", "Qual dessas áreas você teria mais vontade de aprender ou trabalhar?", ["Programação, dados ou inteligência artificial", "Suporte técnico e atendimento ao cliente (telefone, chat ou presencial)", "Energia solar ou internet e fibra óptica", "Trabalho de escritório: administrativo, financeiro, organização de documentos", "Marketing digital, redes sociais e vendas pela internet", "Beleza, gastronomia ou serviço por conta própria", "Audiovisual, música, design, moda ou eventos", "Logística, estoque e entregas"], 2, 3),
    single("apoio_primeiro_passo", "Pensando na área que você marcou, para dar o primeiro passo, o que mais te ajudaria hoje?", ["Alguém me explicar o que a pessoa faz no dia a dia e quanto dá pra ganhar", "Alguém me mostrar o passo a passo: por onde começar", "Alguém me indicar pra uma vaga, um cliente ou uma seleção", "Um curso gratuito perto de casa", "Um curso que eu faça pelo celular, no meu horário", "Alguém acompanhando de perto enquanto eu tento, pra eu não desistir"], 3),
    single("tempo_preparacao", "E para isso acontecer, quanto tempo você toparia se preparar antes de começar a ganhar dinheiro nessa área?", ["Só topo se der pra ganhar alguma coisa desde o começo", "Até 1 mês", "De 3 a 6 meses", "Mais de 6 meses, se eu tiver certeza de que vale a pena", "Hoje eu não teria como parar pra estudar"], 3),
    single("referencia_local", "Você conhece alguém do seu bairro que conseguiu um emprego bom, formalizou o próprio negócio ou entrou numa formação que valeu a pena?", ["Sim, conheço bem essa pessoa", "Conheço de vista, mas não converso", "Não conheço ninguém assim"], 4),
    text("referencia_nome_profissao", "Se você tem alguém como referência, qual é o nome ou apelido dessa pessoa e em que profissão ou área ela trabalha?", 4),
    single("influencia_decisao", "Quando você pensa em buscar uma oportunidade profissional, quem mais influencia sua decisão?", ["Minha família", "Amigos ou pessoas do bairro", "Professores ou pessoas da escola ou faculdade", "Pessoas que já trabalham na área", "Costumo decidir sozinho"], 4),
    scale("confianca_programa", "Quanto você confiaria em um programa que te conecta com alguém do seu bairro para ajudar nos próximos passos profissionais?", ["1 - Nada", "2", "3", "4", "5 - Muita confiança"], 5),
    scale("sentido_para_vida", "Quanto a ideia do Gente Daqui faz sentido para sua vida?", ["1 - Nada a ver", "2", "3", "4", "5 - Faz muito sentido"], 5),
    single("participaria", "Se esse programa existisse, você participaria?", ["Sim, com certeza", "Talvez, depende de como funciona", "Não, não é pra mim"], 5),
    single("canal_acompanhamento", "Qual seria o melhor jeito de te acompanhar no dia a dia?", ["WhatsApp (conversa direta)", "Grupo de WhatsApp com outras pessoas", "Aplicativo ou fórum separado", "Encontro presencial no COMPAZ", "Outro"], 5),
    multiple("fator_permanencia", "O que mais ajudaria você a continuar participando do Gente Daqui?", ["Perceber resultados nos primeiros passos", "Ter alguém acompanhando de perto", "Poder participar em horários flexíveis", "Receber indicações de oportunidades reais", "Participar junto com outras pessoas do bairro"], 2, 6),
    single("frequencia_acompanhamento", "Com que frequência você gostaria de receber acompanhamento?", ["Toda semana", "A cada 15 dias", "Uma vez por mês", "Somente quando eu precisar"], 6),
    text("motivo_desistencia", "Em uma frase: o que faria você desistir de continuar em um programa assim?", 6),
  ],
};
