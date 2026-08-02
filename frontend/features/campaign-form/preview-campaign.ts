import { Campaign } from "./types";

export const previewCampaign: Campaign = {
  slug: "gente-daqui-preview",
  title: "Sua trajetória importa",
  subtitle:
    "Responda algumas perguntas sobre trabalho e território e ganhe um cupom para usar no comércio local.",
  privacyText:
    "Li e aceito que minhas respostas sejam usadas na pesquisa do projeto Gente Daqui e autorizo o uso dos meus dados para receber o cupom.",
  questions: [
    {
      key: "atividade",
      label: "Qual é a sua profissão ou principal atividade?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Estudante",
        "Funcionário(a) CLT",
        "Autônomo(a)/Freelancer",
        "Empreendedor(a) informal",
        "Outro",
      ],
    },
    {
      key: "renda",
      label: "Como é a sua renda hoje?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Bicos ou trabalho por aplicativo",
        "Trabalho informal fixo",
        "Autônomo(a) ou MEI",
        "Emprego com carteira (CLT)",
        "Não estou trabalhando no momento",
      ],
    },
    {
      key: "barreira",
      label: "Qual a maior barreira para você avançar hoje?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Falta de renda para parar e estudar",
        "Falta de tempo",
        "Falta de rede de contatos",
        "Falta de confiança/segurança",
        "Documentação ou burocracia",
      ],
    },
    {
      key: "bairro",
      label: "Em qual bairro ou território você mora?",
      type: "TEXT",
      required: true,
      options: null,
    },
    {
      key: "lideranca",
      label:
        "Você conhece ou confia em alguma liderança comunitária do seu bairro?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Sim, conheço e confio",
        "Conheço, mas não confio muito",
        "Não conheço nenhuma",
      ],
    },
    {
      key: "mentoria",
      label:
        "Você teria interesse em mentoria para crescer em uma área que gosta?",
      type: "SINGLE_CHOICE",
      required: true,
      options: [
        "Sim, tenho muito interesse",
        "Talvez, quero saber mais",
        "Agora não tenho interesse",
      ],
    },
  ],
};
