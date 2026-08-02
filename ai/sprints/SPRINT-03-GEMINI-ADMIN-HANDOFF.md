# Handoff Claude — integração do painel administrativo

**Status:** concluído e publicado no commit `aa4c0c0`; painel validado em produção em 01/08/2026.

Execute este trabalho exclusivamente pela rota `frontend-implement`, obedecendo `frontend/FRONTEND_PROMPT.md`.

## Objetivo

Substituir todos os dados demonstrativos de `frontend/app/admin/page.tsx` por dados reais da API administrativa, sem expor `ADMIN_API_TOKEN` ao navegador.

## Arquitetura obrigatória

1. Criar login administrativo com `ADMIN_PANEL_PASSWORD` lida apenas no servidor.
2. Após autenticação, emitir cookie de sessão assinado com `ADMIN_SESSION_SECRET`, com `HttpOnly`, `Secure` em produção, `SameSite=Strict`, `Path=/` e expiração curta. O path precisa abranger tanto `/admin` quanto o BFF em `/api/admin`.
3. Criar um BFF no Next.js. Ele deve validar a sessão e encaminhar apenas as rotas/métodos abaixo para `ADMIN_API_URL`, adicionando `Authorization: Bearer ${ADMIN_API_TOKEN}` no servidor.
4. O cliente deve chamar somente rotas same-origin do BFF. Nenhum segredo pode ser retornado ao cliente, persistido em `localStorage` ou receber prefixo `NEXT_PUBLIC_`.
5. Não criar uma API genérica de proxy. Use allowlist explícita de método + caminho para impedir encaminhamento arbitrário.

## Contrato disponível na API

- `GET dashboard`
- `GET participants?query=&status=PENDING|DISPATCHED|SENT|FAILED`
- `GET responses`
- `GET campaign`
- `PATCH campaign` com `{ active?, title?, subtitle? }`
- `GET coupons?query=&status=AVAILABLE|ASSIGNED`
- `POST coupons/import` com `{ codes: string[] }`, máximo 5.000
- `GET deliveries?status=PENDING|DISPATCHED|SENT|FAILED`
- `POST deliveries/:submissionId/resend`
- `GET history`

`ADMIN_API_URL` já termina em `/api/admin`. Trate `401`, `403`, `429` e indisponibilidade da API com mensagens claras e sem revelar detalhes internos.

## Regras funcionais

- Remover nomes, telefones, métricas, histórico e cupons demonstrativos.
- Exibir loading, vazio, erro recuperável e confirmação nas ações destrutivas.
- Mapear cupom `AVAILABLE` para “Disponível” e `ASSIGNED` para “Utilizado/atribuído”.
- O bairro vem de `participant.answers.bairro` e pode não existir.
- Exportar CSV a partir dos participantes reais, com escape correto de células e sem enviar os dados a terceiros.
- Importar CSV lendo apenas a coluna de códigos, mostrando inseridos e ignorados.
- O painel de respostas deve usar `responses.questions[].distribution`; não inventar funil de acesso, pois a API mede apenas formulários concluídos.
- O botão de sair deve invalidar o cookie no servidor.
- Manter a rota pública `/` intacta.

## Variáveis server-side

- `ADMIN_API_URL`
- `ADMIN_API_TOKEN`
- `ADMIN_PANEL_PASSWORD`
- `ADMIN_SESSION_SECRET`

## Aceite

- `rg "ADMIN_API_TOKEN" frontend/.next/static` não encontra o valor real após o build.
- Acesso anônimo ao BFF retorna `401`.
- Login inválido não cria sessão; login válido permite carregar o dashboard.
- Dashboard, participantes, respostas, campanha, cupons, entregas e histórico usam dados reais.
- Alterar campanha, importar cupons e solicitar reenvio funcionam e atualizam a interface.
- `npm run build -w @cupomform/frontend` passa.

## Comando para execução

```powershell
.\scripts\ai-harness.ps1 -Task frontend-implement -Prompt "Implemente integralmente o handoff ai/sprints/SPRINT-03-Claude-ADMIN-HANDOFF.md. Preserve a rota pública, não exponha segredos e valide o build." -Run
```
