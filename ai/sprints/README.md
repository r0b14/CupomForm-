# Operação de sprints do CupomForm

Esta pasta é a fonte de verdade para planejamento, execução e aceite. O Codex é responsável por planejamento, backend, frontend, integrações e revisão.

## Ciclo

| Etapa | Rota Codex | Saída necessária | Gate |
| --- | --- | --- | --- |
| Planejamento | `architecture` ou `sprint-plan` | Escopo, riscos e aceite | Plano aprovado |
| Implementação | `implement`, `debug` ou `frontend-implement` | Diff e verificações | Testes/build passam |
| Revisão | `review` | Regressões e casos ausentes | Achados tratados |
| Entrega | humano responsável | Evidências e aceite | Critérios concluídos |

## Como iniciar uma sprint

1. Crie um arquivo com `./scripts/new-sprint.ps1 -Id '03' -Title 'Nome da sprint'`.
2. Mova itens priorizados de `BACKLOG.md` para a sprint.
3. Defina arquivos permitidos e critérios mensuráveis.
4. Implemente com Codex e registre testes/build.
5. Revise o diff e conclua a checklist de entrega.

Segredos, PII, exports do banco e planilhas reais nunca entram em prompts ou documentos de sprint.
