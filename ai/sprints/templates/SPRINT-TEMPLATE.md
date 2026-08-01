# Sprint {{ID}} — {{TITULO}}

**Status:** planejada  
**Objetivo:** {{RESULTADO_DE_NEGOCIO}}  
**Fora do escopo:** {{LIMITES}}

## Critérios de aceite

- [ ] {{CRITERIO_MENSURAVEL_1}}
- [ ] {{CRITERIO_MENSURAVEL_2}}

## Etapa Codex

| Tarefa | Rota/modelo | Arquivos permitidos | Aceite |
| --- | --- | --- | --- |
| Planejar | `architecture` / Sol | {{ARQUIVOS}} | Plano aprovado |
| Implementar | `implement` ou `debug` / Terra | {{ARQUIVOS}} | Testes/build passam |

## Handoff Codex → Gemini

Use o template [CODEX-TO-GEMINI-HANDOFF.md](CODEX-TO-GEMINI-HANDOFF.md) neste arquivo antes da etapa Gemini.

## Etapa Gemini

| Tarefa | Rota/modelo | Arquivos permitidos | Aceite |
| --- | --- | --- | --- |
| Design | `frontend-design` / Gemini 3.6 | `frontend/FRONTEND_PROMPT.md` | Design aprovado |
| Implementar | `frontend-implement` / Gemini 3.6 | `frontend/` | Build frontend passa |
| Revisar | `review` / Gemini 3.5 | somente leitura | Achados tratados/aceitos |

## Entrega humana

- [ ] Evidências de teste registradas.
- [ ] Sem segredos/PII no diff ou nos prompts.
- [ ] Escopo aprovado e pendências transferidas para o backlog.
