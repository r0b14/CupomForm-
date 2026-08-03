# CupomForm — instruções para agentes

## Roteamento de IA

- O Codex é o agente único do projeto e pode implementar backend, frontend e integrações.
- `scripts/ai-harness.ps1` é opcional e serve apenas para tarefas explicitamente delegadas a outro processo Codex. O roteiro versionado está em `ai/routing.json`; os modelos padrão ficam em `ai/models.example.json` e um override local opcional fica em `ai/models.local.json`.
- Não use Gemini nem dependa de prompts, autenticação ou autorização de CLIs externos para modificar `frontend/`.
- Comece por `explore`, `research` ou `review` para tarefas pouco claras. Só use `implement` depois que o alvo e os critérios de aceite estiverem definidos.
- Não envie `.env`, chaves, telefones de usuários, exports do PostgreSQL ou conteúdo da planilha Google a qualquer modelo.
- A rota `security` é somente leitura. Depois de aprovar a análise, abra uma tarefa `implement` separada para a correção.
- Planejamento, handoffs e aceite de cada entrega ficam em `ai/sprints/`; siga `ai/sprints/README.md` antes de iniciar uma sprint.

## Regras do projeto

- Use `development` como branch de integração. `main` recebe somente versões aprovadas por PR; consulte `DEVELOPMENT.md`.
- Frontend: Next.js/Tailwind em `frontend/`; API: NestJS/Prisma em `backend/`. Ambos são mantidos pelo Codex.
- Toda mudança de API deve preservar validação de entrada, normalização de telefone e emissão atômica de cupom.
- Execute `npm test` e `npm run build` após mudar código TypeScript.
- Nunca altere migrações já aplicadas; crie uma nova migração Prisma.
