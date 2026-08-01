# Operação de sprints do CupomForm

Esta pasta é a fonte de verdade para planejamento, execução e aceite. Cada sprint é executada em sequência: **Codex primeiro**, depois **Gemini**, e só então há aceite humano.

## Ciclo obrigatório

| Etapa | Executor/modelo | Saída necessária | Gate para avançar |
| --- | --- | --- | --- |
| Planejamento técnico | Codex / `gpt-5.6-sol` | Escopo, contrato, riscos e aceite no sprint | Você aprova o plano |
| Backend e integrações | Codex / `gpt-5.6-terra` | Diff, testes, build e handoff preenchido | `npm test` e build passam |
| Design de interface | Gemini / `gemini-3.6-pro` | Design/Stitch/Claude Design ou especificação visual | Você aprova o design |
| Implementação frontend | Gemini / `gemini-3.6-pro` | Alterações apenas em `frontend/` e build | Build do frontend passa |
| Revisão visual | Gemini / `gemini-3.5-flash` | Lista de regressões e casos ausentes, sem editar | Você aceita ou reabre tarefa |
| Entrega | Você | Checklist e evidências no sprint | Itens de aceite concluídos |

Não automatize a passagem entre etapas. Termine e revise a saída de um CLI antes de executar o próximo.

## Como iniciar uma sprint

1. Crie um arquivo pelo template: `./scripts/new-sprint.ps1 -Id '03' -Title 'Nome da sprint'`.
2. Mova os itens priorizados de `BACKLOG.md` para a nova sprint.
3. Rode a etapa Codex com `architecture`, depois `implement`/`debug`.
4. Preencha o handoff Codex→Gemini no próprio arquivo da sprint.
5. Rode `frontend-design` e `frontend-implement` no Gemini, em uma sessão separada.
6. Execute a checklist de entrega e registre links de PR/commit, comandos e resultados.

## Convenções

- Cada tarefa deve ter um dono, modelo, arquivos permitidos e critérios objetivos de aceite.
- Codex não modifica `frontend/`; Gemini não modifica `backend/`.
- Segredos, PII, exports do banco e planilhas reais nunca entram nos prompts ou documentos de sprint.
- Handoffs e decisões de produto ficam versionados em `ai/sprints/`; logs brutos e sessões locais ficam em `ai/runs/` e são ignorados.
