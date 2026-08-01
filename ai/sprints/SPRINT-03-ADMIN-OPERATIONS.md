# Sprint 03 — painel administrativo e operação segura

**Status:** em andamento — interface e API administrativas implementadas; migração, segredo de produção e integração do painel pendentes.

**Objetivo:** permitir a operação segura da campanha por uma área administrativa, sem alterar os contratos públicos de emissão de cupons.

## Linha do tempo — 01/08/2026

1. **Fundação e campanha pública:** monorepo Next.js/NestJS/Prisma, formulário por QR Code, emissão atômica e fluxo n8n estruturados.
2. **Publicação inicial:** PostgreSQL, API e frontend foram publicados; health checks, CORS, rate limit e segredos de integração foram reforçados.
3. **Operação visual:** referência `CupomForm Admin.dc.html` foi transformada na rota `/admin`, com navegação, métricas, tabelas, filtros, CSV demonstrativo e layout responsivo.
4. **Estrutura administrativa de backend:** API protegida por Bearer token, auditoria, consultas operacionais, importação de códigos, atualização de campanha e reenvio foram adicionados.
5. **Fase atual:** a base está pronta para conectar o painel à API, aplicar a migração no Coolify e realizar o aceite operacional com dados reais.

## Entregas registradas

- [x] Painel administrativo criado em `frontend/app/admin/page.tsx` e acessível em `/admin`.
- [x] Painel preserva a rota pública `/` e informa claramente que ainda usa dados de demonstração.
- [x] Interface inclui painel geral, participantes, respostas, campanha, cupons, envios e histórico.
- [x] Build do frontend validou a rota `/admin`.
- [x] API administrativa adicionada sob `/api/admin`.
- [x] Acesso administrativo protegido por `Authorization: Bearer <ADMIN_API_TOKEN>`.
- [x] Produção exige `ADMIN_API_TOKEN` com pelo menos 32 caracteres.
- [x] Dashboard, participantes, campanha, cupons, entregas e histórico administrativo disponíveis na API.
- [x] Atualização de campanha, importação validada de códigos e reenvio de entrega implementados.
- [x] Auditoria administrativa persistida em `AdminAuditLog`.
- [x] Migração Prisma criada sem modificar migrações já aplicadas.
- [x] `prisma generate`, `npm test` e `npm run build` aprovados após a implementação.

## Próximas ações de fechamento

- [ ] Configurar `ADMIN_API_TOKEN` no Coolify; não armazenar o valor no Git ou no frontend.
- [ ] Aplicar `npm run prisma:deploy -w @cupomform/backend` no ambiente de produção.
- [ ] Conectar `/admin` aos endpoints `/api/admin` com o token mantido em uma camada segura de servidor; nunca usar `NEXT_PUBLIC_*` para o token.
- [ ] Substituir os dados demonstrativos por respostas, cupons e entregas reais depois da integração autenticada.
- [ ] Testar importação de lote, alteração de campanha e reenvio com dados de homologação.
- [ ] Definir política de rotação/revogação do token e responsáveis pelo acesso administrativo.
- [ ] Executar aceite E2E: emissão, entrega WhatsApp, callback n8n e visualização no painel.

## Contrato administrativo atual

Todos os endpoints exigem `Authorization: Bearer <ADMIN_API_TOKEN>`:

- `GET /api/admin/dashboard`
- `GET /api/admin/participants?query=&status=`
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
- [ ] Operação autenticada validada no ambiente publicado.
- [ ] Painel conectado à API sem token público e com estados de erro adequados.
