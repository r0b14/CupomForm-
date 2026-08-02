# Sprint 03 — painel administrativo e operação segura

**Status:** entregue em produção — painel, BFF, API administrativa, autenticação e integração WhatsApp/Sheets validados de ponta a ponta.

**Objetivo:** permitir a operação segura da campanha por uma área administrativa, sem alterar os contratos públicos de emissão de cupons.

## Linha do tempo — 01/08/2026

1. **Fundação e campanha pública:** monorepo Next.js/NestJS/Prisma, formulário por QR Code, emissão atômica e fluxo n8n estruturados.
2. **Publicação inicial:** PostgreSQL, API e frontend foram publicados; health checks, CORS, rate limit e segredos de integração foram reforçados.
3. **Operação visual:** referência `CupomForm Admin.dc.html` foi transformada na rota `/admin`, com navegação, métricas, tabelas, filtros, CSV demonstrativo e layout responsivo.
4. **Estrutura administrativa de backend:** API protegida por Bearer token, auditoria, consultas operacionais, importação de códigos, atualização de campanha e reenvio foram adicionados.
5. **Integração segura:** o Gemini substituiu os dados demonstrativos por um BFF Next.js com login, cookie assinado e allowlist de rotas; os segredos permanecem somente no servidor.
6. **Publicação e aceite:** API no commit `89fd40e` e frontend no commit `aa4c0c0` foram publicados no Coolify e ficaram saudáveis. Login e dashboard com dados reais foram validados em produção.
7. **Orquestração operacional:** workflow `CupomFormDelivery01` foi importado no n8n com envio pela Evolution e espelho periódico no Google Sheets; variáveis, segredos e credencial Google foram configurados e o workflow foi ativado.
8. **Aceite E2E — 02/08/2026:** envio controlado chegou ao WhatsApp, callback marcou a entrega como `SENT`, o painel exibiu **Enviado** e as abas `entregas`/`respostas` foram sincronizadas.

## Entregas registradas

- [x] Painel administrativo criado em `frontend/app/admin/page.tsx` e acessível em `/admin`.
- [x] Painel preserva a rota pública `/` e usa dados reais da API administrativa.
- [x] Interface inclui painel geral, participantes, respostas, campanha, cupons, envios e histórico.
- [x] Build do frontend validou a rota `/admin`.
- [x] API administrativa adicionada sob `/api/admin`.
- [x] Acesso administrativo protegido por `Authorization: Bearer <ADMIN_API_TOKEN>`.
- [x] Produção exige `ADMIN_API_TOKEN` com pelo menos 32 caracteres.
- [x] Dashboard, participantes, campanha, cupons, entregas e histórico administrativo disponíveis na API.
- [x] Agregação de respostas reais disponível em `GET /api/admin/responses`.
- [x] Filtros administrativos validados antes de chegar ao Prisma e consultas operacionais limitadas.
- [x] Alteração da campanha e importação de cupons persistem a auditoria na mesma transação.
- [x] Atualização de campanha, importação validada de códigos e reenvio de entrega implementados.
- [x] Auditoria administrativa persistida em `AdminAuditLog`.
- [x] Migração Prisma criada sem modificar migrações já aplicadas.
- [x] `prisma generate`, `npm test` e `npm run build` aprovados após a implementação.
- [x] BFF Next.js protege o token da API e autentica o operador por cookie `HttpOnly`.
- [x] Variáveis administrativas foram configuradas somente no runtime do frontend no Coolify.
- [x] API autenticada validada dentro do container com `GET /api/admin/dashboard`.
- [x] Painel publicado em `https://cupom.r0b14.com/admin` e aceito pelo responsável.

## Próximas ações de fechamento

- [x] Configurar `ADMIN_API_TOKEN` no Coolify sem armazenar o valor no Git ou no bundle do frontend.
- [x] Publicar a API; o `backend/Dockerfile` aplica `prisma migrate deploy` automaticamente antes de iniciar o NestJS.
- [x] Conectar `/admin` por um BFF Next.js autenticado por cookie `HttpOnly`.
- [x] Substituir os dados demonstrativos por respostas, cupons e entregas reais.
- [ ] Testar importação de lote, alteração de campanha e reenvio com dados de homologação.
- [ ] Definir política de rotação/revogação do token e responsáveis pelo acesso administrativo.
- [x] Executar aceite E2E: emissão, entrega WhatsApp, callback n8n e visualização no painel.

## Contrato administrativo atual

Todos os endpoints exigem `Authorization: Bearer <ADMIN_API_TOKEN>`:

- `GET /api/admin/dashboard`
- `GET /api/admin/participants?query=&status=`
- `GET /api/admin/responses`
- `GET/PATCH /api/admin/campaign`
- `GET /api/admin/coupons?query=&status=`
- `POST /api/admin/coupons/import` com `{ "codes": ["CODIGO-1"] }`
- `GET /api/admin/deliveries?status=`
- `POST /api/admin/deliveries/:submissionId/resend`
- `GET /api/admin/history`

## Critérios de aceite

- [x] Endpoints públicos existentes permanecem preservados.
- [x] Nenhuma credencial administrativa é exposta no navegador ou em variáveis públicas.
- [x] Alterações administrativas relevantes geram evento de auditoria.
- [x] Compilação e testes do monorepo passam.
- [x] Operação autenticada validada no ambiente publicado.
- [x] Painel conectado à API sem token público e com estados de erro adequados.

## Evidências do aceite em produção

- API: commit `89fd40e`, container saudável em `127.0.0.1:3001/api/health`.
- Frontend: commit `aa4c0c0`, container saudável em `127.0.0.1:3000/`.
- Consulta autenticada retornou campanha `gente-daqui`, 1 submissão, 2 cupons disponíveis, 1 atribuído e 1 entrega com falha.
- Login do painel, carregamento dos dados reais e sessão administrativa foram confirmados pelo responsável.
- Workflow n8n ativo, Evolution conectada, entrega real recebida e mudança para `SENT` confirmada no painel em 02/08/2026.
- Google Sheets validado como espelho operacional, com atualização idempotente por `submission_id`.
- Segredos reais não foram registrados em logs, documentos ou commits.

## Configuração de infraestrutura

### API no Coolify

- `ADMIN_API_TOKEN`: segredo aleatório com pelo menos 32 caracteres, disponível somente em runtime.
- O valor deve ser o mesmo configurado no frontend, mas nunca deve aparecer no bundle ou em uma variável `NEXT_PUBLIC_*`.
- Faça o deploy da API antes do frontend e confirme `GET /api/health`.

### Frontend no Coolify

- `ADMIN_API_URL=https://api-cupom.r0b14.com/api/admin` — runtime apenas.
- `ADMIN_API_TOKEN=<mesmo valor da API>` — runtime apenas.
- `ADMIN_PANEL_PASSWORD=<senha forte e exclusiva>` — runtime apenas.
- `ADMIN_SESSION_SECRET=<segredo aleatório diferente, mínimo 32 caracteres>` — runtime apenas.
- Mantenha `NEXT_PUBLIC_API_URL=https://api-cupom.r0b14.com/api` disponível no build e runtime para o formulário público.

O proxy Next.js deve autenticar o operador, criar cookie `HttpOnly`, `Secure` e `SameSite=Strict`, validar uma allowlist de rotas e somente então adicionar o Bearer token ao pedido enviado para a API.
