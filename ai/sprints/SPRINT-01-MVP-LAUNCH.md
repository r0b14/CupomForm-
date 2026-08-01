# Sprint 01 — campanha MVP e lançamento

**Status:** em andamento — PostgreSQL, API e frontend publicados; n8n/Evolution/Sheets e aceite E2E pendentes.
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
- [x] Aplicar migração e seed no PostgreSQL de produção: concluído no Coolify; lote real ainda pendente.
- [ ] Testar concorrência, repetição e estoque vazio contra banco real: bloqueado por PostgreSQL indisponível.
- [ ] Configurar/testar n8n, Evolution API e Google Sheets: bloqueado por serviços, credenciais e webhooks ausentes.

### Hardening de backend e infraestrutura — 01/08/2026

- [x] Rate limit efetivamente aplicado como guard global; limites específicos dos endpoints públicos preservados.
- [x] Callback interno do n8n usa comparação de segredo resistente a ataques de temporização.
- [x] `GET /api/health` verifica API e conexão PostgreSQL e pode ser usado pelo health check do Coolify/Docker.
- [x] Backend reconhece múltiplas origens CORS separadas por vírgula e confia em apenas um proxy reverso.
- [x] Variáveis críticas são validadas no boot; produção exige URLs e dois segredos distintos com pelo menos 32 caracteres.
- [x] Seed idempotente atualizado para a campanha Gente Daqui com 12 perguntas do instrumento de pesquisa; outras campanhas ficam inativas.
- [x] Dockerfile da API expõe a porta 3001, aplica migrações no boot e possui health check.
- [x] Script local gera três segredos independentes sem gravá-los no repositório.
- [x] `npm test -w @cupomform/backend`: 18/18 testes aprovados em 5 arquivos.
- [x] `npm run build -w @cupomform/backend`: aprovado.
- [x] `npx tsc -p backend/tsconfig.json --noEmit`: aprovado.
- [x] `prisma generate` e `prisma validate`: aprovados; a validação usou somente uma URL PostgreSQL sintática temporária.
- [x] PostgreSQL 16, API e frontend provisionados no Coolify com health checks aprovados.
- [ ] E2E de entrega real: depende da configuração do n8n, Evolution API e Google Sheets.

### Evidências de produção — 01/08/2026

- [x] PostgreSQL 16 Alpine persistente no Coolify, acessível somente pela rede interna.
- [x] API publicada em `https://api-cupom.r0b14.com`, porta 3001, health check `GET /api/health` aprovado.
- [x] Migração Prisma aplicada automaticamente pelo container sem pendências.
- [x] Seed executado via SSH dentro do container; campanha `gente-daqui`, 12 perguntas e cupons `GENTE-DEV-*` criados.
- [x] `GET /api/campaign` validado dentro do container e retornando a campanha completa.
- [x] Frontend publicado em `https://cupom.r0b14.com`, porta 3000, health check `/` aprovado.
- [x] DNS `api-cupom.r0b14.com` e `cupom.r0b14.com` apontado para o servidor Coolify.
- [x] Segredos reais mantidos apenas no Coolify; `.env.example` permanece sem credenciais.
- [x] Kit SSH protegido pelo `.gitignore` e permissões locais restritas.
- [x] Incidentes de deploy resolvidos: artefato Nest em `dist/main.js`; probes em `127.0.0.1`; Next standalone com `HOSTNAME=0.0.0.0`.
- [ ] Workflow n8n importado e ativado.
- [ ] Evolution API, callback da API e Google Sheets validados de ponta a ponta.
- [ ] Cupons reais importados; o estoque atual é somente de homologação.

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
- Pendente: lote real de cupons, n8n/Evolution/Sheets e teste E2E em ambiente público.
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
- [x] Frontend publicado e saudável em `https://cupom.r0b14.com`.
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
- [x] `npm test` e builds de backend/frontend aprovados.
- [x] Testes e build do backend aprovados localmente em 01/08/2026.
- [ ] Formulário testado em celular físico.
- [ ] Cupom único, repetição e estoque vazio testados.
- [ ] WhatsApp e linha no Sheets confirmados.
- [ ] URL HTTPS testada pelo QR Code.
- [x] Handoff e evidências preenchidos neste arquivo.
