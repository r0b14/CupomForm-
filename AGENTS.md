# CupomForm — instruções para agentes

## Roteamento de IA

- Use `scripts/ai-harness.ps1` para tarefas delegadas a Codex ou Gemini. O roteiro versionado está em `ai/routing.json`; os modelos padrão ficam em `ai/models.example.json` e um override local opcional fica em `ai/models.local.json`.
- Toda tarefa que modificar `frontend/` deve usar a rota `frontend-implement` (Gemini) e obedecer `frontend/FRONTEND_PROMPT.md`. Codex não implementa o front-end deste projeto.
- Comece por `explore`, `research` ou `review` para tarefas pouco claras. Só use `implement` depois que o alvo e os critérios de aceite estiverem definidos.
- Não envie `.env`, chaves, telefones de usuários, exports do PostgreSQL ou conteúdo da planilha Google a qualquer modelo.
- A rota `security` é somente leitura. Depois de aprovar a análise, abra uma tarefa `implement` separada para a correção.
- Planejamento, handoffs e aceite de cada entrega ficam em `ai/sprints/`; siga `ai/sprints/README.md` antes de iniciar uma sprint.

## Regras do projeto

- Frontend: Next.js/Tailwind em `frontend/`, mantido pelo Gemini; API: NestJS/Prisma em `backend/`.
- Toda mudança de API deve preservar validação de entrada, normalização de telefone e emissão atômica de cupom.
- Execute `npm test` e `npm run build` após mudar código TypeScript.
- Nunca altere migrações já aplicadas; crie uma nova migração Prisma.
