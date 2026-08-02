# Briefing Gemini — componentização do formulário público

## Objetivo

Refatorar o formulário público do CupomForm, hoje concentrado em `frontend/app/page.tsx`, sem alterar sua experiência, integrações ou regras de negócio. A página atual mistura carregamento de campanha, estado do formulário, validação, chamadas HTTP e a renderização de todas as telas. O resultado deve ser uma estrutura legível, testável e fácil de evoluir.

## Contexto e limites

- Escopo exclusivo: `frontend/`.
- Não modificar `backend/`, Prisma, rotas da API, Docker, variáveis de ambiente ou contratos HTTP.
- Manter o App Router do Next.js e Tailwind já adotados no projeto.
- Não adicionar bibliotecas para gerenciamento de estado, formulários ou validação; usar React e TypeScript nativos.
- Não enviar a modelos de IA dados reais, segredos, `.env`, telefones ou exportações de banco.
- Ler e obedecer `frontend/FRONTEND_PROMPT.md` antes de editar.

## Comportamento que deve permanecer idêntico

1. `/?preview=1` continua a carregar os dados demonstrativos locais, gerar o cupom `GENTE10` e não chamar a API.
2. Sem `preview=1`, a página busca `GET ${NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/campaign`.
3. O envio continua em `POST /submissions` com `{ name, phone, answers, consent }`.
4. O fluxo possui: carregamento, formulário em etapas, cupom, cupons esgotados e campanha indisponível.
5. A validação atual é preservada: nome com ao menos 2 caracteres, WhatsApp com DDD e pelo menos 10 dígitos, perguntas obrigatórias preenchidas e consentimento obrigatório.
6. A paginação das perguntas permanece com três perguntas por etapa.
7. O tratamento de erro, a identificação de cupons esgotados, a máscara de telefone, os textos, a acessibilidade existente e o visual atual não devem regredir.
8. As URLs, metadados, ícones, página administrativa e rotas `app/api/*` estão fora do escopo.

## Estrutura alvo

Use uma feature coesa, evitando componentes artificiais de uma linha. Nomes equivalentes são aceitáveis se as responsabilidades forem mantidas.

```text
frontend/
├── app/
│   └── page.tsx                         # composição mínima: renderiza CampaignForm
└── features/
    └── campaign-form/
        ├── CampaignForm.tsx             # estado, carregamento, navegação e envio
        ├── types.ts                     # Campaign, Question, Result, estados e tipos auxiliares
        ├── api.ts                       # apiUrl, carregamento de campanha, envio e apiError
        ├── preview-campaign.ts          # campanha demonstrativa, isolada do componente
        ├── validation.ts                # regras puras de validação e isSoldOut, quando apropriado
        ├── formatters.ts                # máscara/normalização visual do telefone, se extraída
        └── components/
            ├── FormShell.tsx            # moldura visual, progresso, cabeçalho e rodapé
            ├── IdentityStep.tsx         # campos nome e WhatsApp
            ├── QuestionsStep.tsx        # grupo da etapa de perguntas
            ├── ConsentStep.tsx          # consentimento e CTA final
            ├── ChoiceField.tsx          # pergunta SINGLE_CHOICE
            ├── TextField.tsx            # pergunta TEXT
            ├── CouponScreen.tsx         # sucesso/cupom e tentativa de envio pelo WhatsApp
            ├── SoldOutScreen.tsx        # estado sem cupons
            └── UnavailableScreen.tsx    # falha ao carregar campanha
```

## Diretrizes de implementação

- `app/page.tsx` deve ter apenas a composição da página; não manter dados demonstrativos, fetch, validação ou JSX das etapas nele.
- `CampaignForm.tsx` pode continuar como dono do estado compartilhado (`campaign`, respostas, etapa, erros, tela, envio e resultado). Não introduzir Context ou estado global sem necessidade.
- Componentes de etapa recebem dados e callbacks tipados; eles não devem chamar a API diretamente.
- Funções puras e tipos não devem ficar em componentes React.
- Não duplicar o tipo `Question` ou as regras de validação entre componentes.
- Preservar `"use client"` somente nos arquivos que usam hooks, eventos do navegador ou outros recursos de cliente.
- Evitar alterar classes Tailwind a menos que a separação do componente exija; a refatoração é estrutural, não um redesign.
- Manter mensagens em português e os atributos HTML de validação/acessibilidade.
- Se a extração tornar os componentes menores e claros, prefira funções explícitas a abstrações genéricas complexas.

## Critérios de aceite

- [ ] `frontend/app/page.tsx` fica focado na composição e não concentra a lógica do formulário.
- [ ] Os estados de carregamento, formulário, cupom, esgotado e indisponível continuam funcionais.
- [ ] Preview e produção mantêm exatamente os mesmos contratos e efeitos colaterais.
- [ ] Nenhuma alteração é feita em `backend/` ou nos endpoints.
- [ ] TypeScript não apresenta erros e não há uso de `any` novo sem justificativa.
- [ ] A interface pública mantém o mesmo conteúdo e aparência em desktop e mobile.
- [ ] `npm run build -w @cupomform/frontend` termina com sucesso.
- [ ] O handoff final lista os arquivos criados/alterados e qualquer divergência de comportamento encontrada.

## Validação manual sugerida

1. Abrir `http://localhost:3000/?preview=1` (ou na porta alternativa indicada pelo Next.js, como `http://localhost:3005/?preview=1`, se a 3000 estiver ocupada por outra aplicação).
2. Testar o campo WhatsApp durante a digitação: confirmar que os separadores `()` e `-` aparecem de forma fluida (`(XX) XXXXX-XXXX` para celular/WhatsApp e `(XX) XXXX-XXXX` para fixos), além do suporte ao colar números com `+55`.
3. Testar avanço e retorno entre todas as etapas.
4. Conferir mensagens de erro para nome, WhatsApp, pergunta obrigatória e consentimento.
5. Finalizar o preview e confirmar que aparece `GENTE10` sem requisição de submissão.
6. Abrir sem preview com a API disponível (`http://localhost:3001/api`) e validar carregamento e envio.
7. Simular campanha indisponível e cupons esgotados, confirmando que as telas correspondentes ainda aparecem.

## Observações de Teste Local e Portas

- Se a porta `3000` estiver ocupada no ambiente local (por exemplo, por outra aplicação como Excalidraw), o Next.js redirecionará a dev server para uma porta livre (`3001`, `3005`, etc.).
- Sempre verifique a porta informada no terminal (`- Local: http://localhost:<porta>`) e acesse adicionando o parâmetro `?preview=1`.

## Pedido pronto para o Gemini

> Refatore apenas o frontend do CupomForm conforme `docs/frontend/CAMPAIGN_FORM_COMPONENTIZATION.md` e `frontend/FRONTEND_PROMPT.md`. Preserve integralmente o comportamento, o visual e os contratos da API do formulário público. Não altere o backend nem adicione dependências. Ao finalizar, execute `npm run build -w @cupomform/frontend` e informe os arquivos modificados, o resultado do build e eventuais riscos ou divergências.

