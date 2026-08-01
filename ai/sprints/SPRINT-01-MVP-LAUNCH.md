# Sprint 01 — campanha MVP e lançamento

**Status:** em andamento — frontend implementado localmente; integrações reais e aceite final pendentes.  
**Objetivo:** disponibilizar uma campanha real por QR Code com emissão única de cupom e envio opcional por WhatsApp.

## Escopo e aceite

- Uma pessoa com telefone válido responde, recebe um cupom disponível e vê o código na tela.
- O mesmo telefone recebe o mesmo cupom se repetir o formulário.
- O botão de WhatsApp cria uma solicitação e o n8n registra o resultado na API e no Google Sheets.
- O fluxo funciona no domínio HTTPS publicado no Coolify, em celular.
- Estoque esgotado e falha de envio exibem mensagens claras sem criar cupom duplicado.

## Etapa Codex — backend e integrações

| Ordem | Tarefa | Rota/modelo | Arquivos permitidos | Evidência |
| --- | --- | --- | --- | --- |
| 1 | Revisar contratos, variáveis e dados da campanha real | `architecture` / Sol | `backend/`, `n8n/`, `.env.example`, este arquivo | Plano aprovado |
| 2 | Aplicar migração, seed/importar lote e validar PostgreSQL real | `implement` / Terra | `backend/`, documentação | Contagem de cupons e testes |
| 3 | Configurar/validar callbacks do n8n e Evolution | `implement` / Terra | `backend/`, `n8n/` | Envio de teste e status `SENT`/`FAILED` |
| 4 | Testar casos de concorrência, repetição e estoque vazio | `debug` / Terra | `backend/` e testes | Resultado dos testes |

### Evidências Codex registradas — 31/07/2026

- [x] `npm run db:generate` gerou o Prisma Client.
- [x] `npx prisma validate --schema backend/prisma/schema.prisma` passou com URL PostgreSQL local de sintaxe, sem conexão externa.
- [x] `npm test` passou: 2/2 testes.
- [x] `npm run build` passou: frontend Next.js e backend NestJS.
- [x] Contratos públicos revisados e preservados.
- [ ] Aplicar migração/seed/importar lote real: bloqueado por ausência de `DATABASE_URL` e PostgreSQL local.
- [ ] Testar concorrência, repetição e estoque vazio contra banco real: bloqueado por PostgreSQL indisponível.
- [ ] Configurar/testar n8n, Evolution API e Google Sheets: bloqueado por serviços, credenciais e webhooks ausentes.

### Comandos

```powershell
.\scripts\ai-harness.ps1 -Task architecture -Prompt 'Planeje a configuração real da Sprint 01 seguindo ai/sprints/SPRINT-01-MVP-LAUNCH.md' -Run
.\scripts\ai-harness.ps1 -Task implement -Prompt 'Execute a etapa Codex aprovada da Sprint 01; não altere frontend/.' -Run
```

## Handoff Codex → Gemini — preenchido em 31/07/2026

### Contrato congelado

- Base local: `http://localhost:3001/api`; produção deve usar `NEXT_PUBLIC_API_URL` com o domínio público da API.
- `GET /api/campaign`: retorna `slug`, `title`, `subtitle`, `privacyText` e `questions[]` (`key`, `label`, `type`, `required`, `options`).
- `POST /api/submissions`: recebe `{ name, phone, answers, consent }`; retorna `{ submissionId, couponCode, isExisting }` ou erro de validação/estoque.
- `POST /api/submissions/:id/delivery`: retorna HTTP 202 e registra solicitação idempotente; o envio real depende do webhook n8n.

### Estados que o frontend deve tratar

- Loading enquanto `GET /api/campaign` não termina.
- Validação de nome, WhatsApp, perguntas obrigatórias e consentimento antes do POST.
- Estoque esgotado quando a API informar que os cupons se esgotaram.
- Falha de rede/API e falha de solicitação de envio sem expor detalhes internos.

### Restrições

- Variável pública permitida: somente `NEXT_PUBLIC_API_URL`.
- Gemini pode alterar apenas `frontend/` e não pode criar persistência local/fingir entrega WhatsApp.
- Pendente: dados reais de campanha, banco, n8n/Evolution/Sheets e teste E2E em ambiente público.
- Evidências: `npm run db:generate`, `prisma validate`, `npm test`, `npm run build` e `git diff --check` passaram.

## Etapa Gemini — design e frontend

| Ordem | Tarefa | Rota/modelo | Arquivos permitidos | Evidência |
| --- | --- | --- | --- | --- |
| 5 | Criar/aprovar layout no Stitch ou Claude Design | `frontend-design` / Gemini 3.6 | `frontend/FRONTEND_PROMPT.md`, sem código | Link/export ou especificação aprovada |
| 6 | Implementar a interface aprovada | `frontend-implement` / Gemini 3.6 | somente `frontend/` | `npm run build -w @cupomform/frontend` |
| 7 | Revisar responsividade, estados e acessibilidade | `review` / Gemini 3.5 | somente leitura | Lista de achados e decisão |

### Entrega frontend registrada — 31/07/2026

- [x] Design de referência `frontend/app/CupomForm.dc.html` transformado em componentes React/Tailwind em `frontend/app/page.tsx`.
- [x] Fluxo mobile em etapas: identificação, perguntas dinâmicas carregadas da API, consentimento, cupom e solicitação de WhatsApp.
- [x] Estados implementados: carregamento, campanha indisponível, validação, estoque esgotado, cupom emitido e solicitação de envio.
- [x] Contratos preservados: `GET /api/campaign`, `POST /api/submissions` e `POST /api/submissions/:id/delivery`.
- [x] `npm run build -w @cupomform/frontend` passou.
- [x] Frontend respondeu HTTP 200 em `http://localhost:3000`.
- [ ] Revisão visual/QA no Gemini 3.5 após configuração da campanha e API reais.

### Comandos

```powershell
.\scripts\ai-harness.ps1 -Task frontend-design -Prompt 'Use o handoff da Sprint 01 e frontend/FRONTEND_PROMPT.md para gerar a especificação visual.' -Run
.\scripts\ai-harness.ps1 -Task frontend-implement -Prompt 'Implemente o design aprovado da Sprint 01. Altere somente frontend/.' -Run
.\scripts\ai-harness.ps1 -Task review -Prompt 'Revise o diff da Sprint 01, com foco em mobile, estados da API e acessibilidade. Não edite arquivos.' -Run
```

## Checklist final de entrega

- [ ] Dados de campanha e lote real conferidos.
- [ ] Segredos configurados somente no Coolify/n8n.
- [ ] `npm test` e `npm run build` aprovados.
- [ ] Formulário testado em celular físico.
- [ ] Cupom único, repetição e estoque vazio testados.
- [ ] WhatsApp e linha no Sheets confirmados.
- [ ] URL HTTPS testada pelo QR Code.
- [ ] Handoff e evidências preenchidos neste arquivo.
