# Publicação no Coolify — ações do responsável pela infraestrutura

Esta é a parte que depende de acesso às suas contas, DNS, Coolify, Evolution, Google e n8n. Use um projeto `CupomForm` no Coolify para agrupar os recursos.

## 1. Recursos e domínios

Crie ou configure estes recursos:

| Recurso | Origem/porta | Domínio público sugerido |
| --- | --- | --- |
| PostgreSQL | Banco gerenciado pelo Coolify | nenhum |
| API NestJS | `backend/Dockerfile`, porta `3001` | `api.seu-dominio.com` |
| Frontend Next.js | `frontend/Dockerfile`, porta `3000` | `cupom.seu-dominio.com` |
| n8n | sua nova workspace n8n | `n8n.seu-dominio.com` |

No recurso de PostgreSQL, gere ou copie a URL interna de conexão. Ela deve ser usada apenas como `DATABASE_URL` da API. Não exponha a porta do banco à internet.

## 2. Variáveis no Coolify

Gere três segredos aleatórios e longos. O script abaixo imprime valores novos no terminal; copie-os diretamente para o Coolify/n8n e não os salve no repositório:

```powershell
.\scripts\generate-production-secrets.ps1
```

Use valores distintos para `N8N_SHARED_SECRET`, `INTERNAL_CALLBACK_SECRET` e `N8N_ENCRYPTION_KEY`.

### API (backend)

```dotenv
DATABASE_URL=<URL interna fornecida pelo PostgreSQL do Coolify>
FRONTEND_URL=https://cupom.seu-dominio.com
N8N_DELIVERY_WEBHOOK_URL=https://n8n.seu-dominio.com/webhook/cupom-delivery
N8N_SHARED_SECRET=<segredo 1>
INTERNAL_CALLBACK_SECRET=<segredo 2>
PORT=3001
SWAGGER_ENABLED=true
```

### Frontend (build environment)

```dotenv
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com/api
```

`NEXT_PUBLIC_API_URL` é incorporada durante o build do Next.js. Faça um novo deploy do frontend sempre que alterá-la.

### n8n

Além das variáveis normais da instalação (host, protocolo, URL pública, chave de criptografia e volume persistente), crie as variáveis da [checklist de importação](../n8n/IMPORT-CHECKLIST.md#antes-de-importar). Use os mesmos dois segredos configurados na API.

Para o n8n em domínio público, configure também:

```dotenv
N8N_HOST=n8n.seu-dominio.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.seu-dominio.com/
N8N_ENCRYPTION_KEY=<chave longa e persistente>
```

## 3. Ordem segura de publicação

1. Publique PostgreSQL e API; execute a migração Prisma pelo processo de deploy configurado no `backend/Dockerfile`.
2. Configure o health check da API como `GET /api/health` e confira `https://api.seu-dominio.com/api/docs`.
3. Publique o frontend e abra `https://cupom.seu-dominio.com`.
4. Configure Evolution e Google Sheets no n8n, importe e ative o workflow.
5. Só então habilite a campanha e faça um envio com um número de teste autorizado.

## 4. Conferência final

- O formulário abre a campanha em produção.
- Uma resposta entrega um cupom sem repetir código.
- A opção de enviar cria uma execução no n8n.
- A mensagem chega ao número de teste.
- A entrega termina como `SENT` ou `FAILED`, e existe uma linha na planilha.
- Certificados HTTPS estão ativos nos três domínios públicos.
- `GET https://api.seu-dominio.com/api/health` retorna `status: ok` e `database: connected`.

Se algum serviço falhar, mantenha a campanha desabilitada até o fluxo estar íntegro: a reserva de cupom e o status de entrega ficam rastreáveis no PostgreSQL.

## 5. O que você precisa fazer na interface

Estas ações não devem ser delegadas nem registradas no Git, pois envolvem contas e segredos:

1. Criar o projeto `CupomForm` no Coolify e conectar este repositório/branch.
2. Criar o PostgreSQL persistente e copiar sua URL **interna** diretamente para `DATABASE_URL` da API.
3. Apontar três domínios/subdomínios no DNS: frontend, API e n8n.
4. Executar `.\scripts\generate-production-secrets.ps1` e colar cada valor somente nos serviços indicados.
5. Informar no Coolify os Dockerfiles e portas da tabela da seção 1.
6. Importar o JSON do workflow na workspace n8n e selecionar a credencial Google Sheets.
7. Informar diretamente no n8n a URL, instância e chave da Evolution API.
8. Rodar o seed uma única vez pelo terminal da API: `npm run prisma:seed -w @cupomform/backend`.
9. Importar o lote real de cupons; os códigos `GENTE-DEV-*` do seed servem apenas para teste/homologação.
10. Fazer um envio para seu próprio número e conferir API, n8n, WhatsApp, PostgreSQL e Sheets antes de divulgar o QR Code.
