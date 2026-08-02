# Publicação no Coolify — ações do responsável pela infraestrutura

Esta é a parte que depende de acesso às suas contas, DNS, Coolify, Evolution, Google e n8n. Use um projeto `CupomForm` no Coolify para agrupar os recursos.

## 1. Recursos e domínios

Crie ou configure estes recursos:

| Recurso | Origem/porta | Domínio público sugerido |
| --- | --- | --- |
| PostgreSQL | Banco gerenciado pelo Coolify | nenhum |
| API NestJS | `backend/Dockerfile`, porta `3001` | `api-cupom.r0b14.com` |
| Frontend Next.js | `frontend/Dockerfile`, porta `3000` | `cupom.r0b14.com` |
| n8n | workspace existente | `n8n.r0b14.com` |

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
ADMIN_API_TOKEN=<segredo administrativo longo e exclusivo>
PORT=3001
SWAGGER_ENABLED=true
```

### Frontend

```dotenv
NEXT_PUBLIC_API_URL=https://api-cupom.r0b14.com/api
HOSTNAME=0.0.0.0
PORT=3000
ADMIN_API_URL=https://api-cupom.r0b14.com/api/admin
ADMIN_API_TOKEN=<mesmo token administrativo configurado na API>
ADMIN_PANEL_PASSWORD=<senha forte e exclusiva do operador>
ADMIN_SESSION_SECRET=<segredo de sessão longo e exclusivo>
```

`NEXT_PUBLIC_API_URL` deve estar disponível no build e no runtime. As quatro variáveis administrativas, `HOSTNAME` e `PORT` são somente de runtime. Nunca use o prefixo `NEXT_PUBLIC_` em token, senha ou segredo de sessão.

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
2. Configure o health check da API como `GET http://127.0.0.1:3001/api/health` e confira `https://api-cupom.r0b14.com/api/docs`.
3. Publique o frontend, configure o health check como `GET http://127.0.0.1:3000/` e abra `https://cupom.r0b14.com`.
4. Acesse `https://cupom.r0b14.com/admin`, valide senha inválida, login, dados reais e logout.
5. Configure Evolution e Google Sheets no n8n, importe e ative o workflow.
6. Só então habilite a campanha e faça um envio com um número de teste autorizado.

### Branches e ambientes

- Produção deve acompanhar `main`.
- Homologação deve acompanhar `development`, preferencialmente em outro recurso e domínio.
- Durante a reta final de 01/08/2026, o recurso público do frontend foi ligado temporariamente a `development`; nessa janela, todo push deve passar por testes e build antes de ser enviado.
- Depois do aceite, abra PR `development` → `main`, volte o Git Source de produção para `main` e faça redeploy do SHA do merge.

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
8. Rodar o seed uma única vez dentro do container da API: `npm run prisma:seed -w @cupomform/backend`. Se o terminal do Coolify não funcionar, conecte por SSH, localize a API com `sudo docker ps` e execute com `sudo docker exec`.
9. Importar o lote real de cupons; os códigos `GENTE-DEV-*` do seed servem apenas para teste/homologação.
10. Fazer um envio para seu próprio número e conferir API, n8n, WhatsApp, PostgreSQL e Sheets antes de divulgar o QR Code.

## 6. Estado atual em 01/08/2026

- PostgreSQL 16: publicado e saudável.
- API: `https://api-cupom.r0b14.com`, publicada e saudável.
- Campanha `gente-daqui`: seed aplicado com 12 perguntas e três cupons de homologação.
- Frontend: `https://cupom.r0b14.com`, publicado e saudável.
- Painel administrativo: `https://cupom.r0b14.com/admin`, integrado à API e validado com autenticação em produção.
- n8n: `https://n8n.r0b14.com`, existente; workflow CupomForm ainda precisa ser importado/configurado.
- Evolution API e Google Sheets: integração E2E ainda pendente.
