# CupomForm

MVP de formulário de campanha: coleta respostas, reserva um cupom único por WhatsApp e permite o envio opcional pela Evolution API, orquestrado no n8n.

## Executar localmente

1. Copie `.env.example` para `.env` e troque todos os segredos.
2. Suba a infraestrutura: `docker compose up --build`.
3. No primeiro uso, aplique a migração e dados de exemplo dentro do serviço de API:

   ```bash
   docker compose exec api npm run prisma:seed -w @cupomform/backend
   ```

   A migração é aplicada automaticamente na inicialização da API. O seed cria a campanha `gente-daqui` e suas 19 perguntas, organizadas em seções.

   Os quatro cupons de teste `GENTE-005-DEV-*` e `GENTE-010-DEV-*` só são criados quando `SEED_DEV_COUPONS=true` — o `docker-compose.yml` já define isso no serviço `api`. **Nunca defina essa variável em produção:** a ausência dela é o que permite rodar o seed no ambiente real (para corrigir perguntas, por exemplo) sem injetar cupons falsos no estoque. Em produção, os códigos reais entram pelo painel `/admin`.

4. Acesse `http://localhost:3000`; o painel fica em `http://localhost:3000/admin` e o n8n em `http://localhost:5678`.

A saúde da API e da conexão PostgreSQL pode ser verificada em `http://localhost:3001/api/health`.

A documentação interativa da API fica em `http://localhost:3001/api/docs` (OpenAPI JSON em `/api/docs-json`). Defina `SWAGGER_ENABLED=false` para ocultá-la em um ambiente público.

Para navegar pelo formulário completo sem iniciar API, PostgreSQL ou n8n, abra `http://localhost:3000/?preview=1`. Esse modo é explicitamente local: usa dados demonstrativos, entrega o código `GENTE10` e não persiste nem envia WhatsApp.

## Adicionar mais cupons

### Pelo painel administrativo (recomendado)

1. Acesse `/admin`, faça login e abra **Cupons (CSV)**.
2. Clique em **Selecionar CSV** ou em **Colar códigos**.
3. Envie até 5.000 códigos por lote. Em texto, use um código por linha ou separe-os por vírgula/ponto e vírgula.
4. Confira o resultado apresentado pelo painel: quantidade inserida e quantidade ignorada.
5. Verifique na lista se os novos cupons aparecem com status **Disponível**.

O CSV mais simples possui uma única coluna. O cabeçalho `code`, `codigo` ou `código` é opcional:

```csv
code
GENTE-005-0001
GENTE-005-0002
GENTE-010-0001
GENTE-010-0002
```

O segmento central define o desconto: `005` representa 5% e `010` representa 10%. Outros padrões são rejeitados. Enquanto houver estoque dos dois tipos, o backend sorteia 5% ou 10% com chance de 50% para cada; se o tipo sorteado estiver esgotado, utiliza o outro. A reserva continua transacional e concorrente.

Os cupons são vinculados à campanha ativa. O painel remove espaços, converte os códigos para maiúsculas e ignora repetições do lote ou códigos já existentes. Cada código pode ter no máximo 80 caracteres. A importação não modifica cupons já atribuídos.

### Pela API administrativa

No Swagger (`/api/docs`), autorize com o `ADMIN_API_TOKEN` e execute `POST /api/admin/coupons/import`:

```json
{
  "codes": ["GENTE-005-0001", "GENTE-010-0001"]
}
```

A resposta informa `inserted` e `ignored`. O endpoint aceita de 1 a 5.000 códigos e registra a operação no histórico administrativo.

### Pelo terminal (alternativa operacional)

O comando abaixo lê a primeira coluna do CSV e exige `DATABASE_URL` apontando para o banco correto:

```bash
COUPON_CSV_PATH=/caminho/cupons.csv npm run db:import-coupons
```

No PowerShell:

```powershell
$env:COUPON_CSV_PATH='C:\caminho\cupons.csv'; npm run db:import-coupons
```

Em Docker/Coolify, o caminho precisa existir dentro do container da API. Prefira o painel para produção. Não execute novamente o seed para adicionar estoque, não insira diretamente no PostgreSQL e não edite o Google Sheets: o PostgreSQL é a fonte de verdade e a planilha é apenas um espelho operacional.

## Editar as perguntas da campanha sem quebrar nada

As perguntas da campanha ativa (`gente-daqui`) são definidas em [backend/prisma/seed.ts](backend/prisma/seed.ts) e aplicadas por um upsert idempotente por `key`. O container da API executa migração e seed automaticamente antes de iniciar; rodar o seed novamente também é seguro. Não edite perguntas direto no PostgreSQL nem no Google Sheets.

> **O deploy precisa concluir o seed.** As perguntas vêm do banco, não diretamente do build. O Dockerfile executa o seed automaticamente e só inicia a API se ele terminar com sucesso. Depois de publicar uma mudança em `seed.ts`, confirme o resultado em `https://api-cupom.r0b14.com/api/campaign`.

Regras do schema (`backend/prisma/schema.prisma`) que precisam ser respeitadas:

- `key` e `position` são únicos por campanha. Reordenar perguntas é só trocar os números de `position` no array `questions` do seed; para adicionar uma pergunta nova, use uma `key` inédita e uma `position` livre.
- `type` precisa ser um dos valores de `QuestionType`: `SINGLE_CHOICE` (uma alternativa), `MULTIPLE_CHOICE` (checkboxes com limite em `maxSelections`), `TEXT` (resposta livre) ou `SCALE` (escala exibida como barra deslizante). Perguntas são agrupadas no formulário pelo campo `section`.
- Para remover uma pergunta, tire-a do array `questions` do seed: o próprio seed apaga do banco quem não está mais na lista. As respostas já registradas continuam guardadas no histórico de cada participante, só saem da lista de perguntas ativas e dos relatórios do `/admin`.

**Atenção ao `key`:** cada resposta é salva como um JSON livre, indexado pelo `key` da pergunta, dentro do registro de cada participante (`Submission.answers`). Isso tem duas consequências importantes:

- **Renomear o `key` de uma pergunta existente não migra as respostas antigas.** Elas ficam guardadas sob a chave antiga e somem da distribuição em `/admin` → Respostas (que só lê pelo `key` atual das perguntas ativas). Se só o texto mudou, edite apenas o `label` e mantenha o `key`.
- **Reaproveitar o `key` de uma pergunta removida para uma pergunta com sentido diferente mistura dados antigos e novos** na mesma distribuição. Prefira sempre uma `key` nova quando o que está sendo medido muda de fato.

## Ler os resultados em `/admin` → Respostas

A tela é montada inteiramente a partir do que `GET /api/admin/responses` devolve — que por sua vez vem da tabela `Question`. **Nenhuma pergunta está escrita no código do painel**, então adicionar, remover, reordenar ou trocar o `type` de uma pergunta no seed passa a valer sozinho depois de rodar o seed.

- **Formas de apresentação.** Cada pergunta pode ser vista como barras, colunas, rosca ou tabela. O padrão vem do tipo: `SCALE` abre em colunas na ordem 1→5 (e ganha a média no cabeçalho), `SINGLE_CHOICE` abre em barras. `TEXT` não vira gráfico — mostra as respostas escritas mais recentes, porque cada uma é única.
- **Filtros.** Escolha uma pergunta e um valor para recortar a base; clicar em qualquer barra, fatia ou linha faz o mesmo. Vários valores da mesma pergunta somam (OU) e perguntas diferentes se cruzam (E). Todas as distribuições e a média das escalas são recalculadas pelo backend sobre o recorte.
- **Opções sem resposta continuam na lista**, com zero, para não dar a impressão de que a alternativa não existe.
- **Valores fora da lista de opções atual** aparecem marcados como `antigo`. É o caso de respostas gravadas antes de uma opção ser renomeada — elas continuam contando em vez de sumirem do relatório.

## Deploy no Coolify

Estado de homologação em 01/08/2026:

- Frontend: `https://cupom.r0b14.com`.
- API: `https://api-cupom.r0b14.com`.
- Health: `https://api-cupom.r0b14.com/api/health`.
- Swagger: `https://api-cupom.r0b14.com/api/docs`.
- PostgreSQL 16, API, frontend, painel administrativo e n8n estão publicados e saudáveis. Evolution, callback e Google Sheets foram validados de ponta a ponta; o lote atual ainda é de homologação.

- Crie PostgreSQL persistente no Coolify e configure `DATABASE_URL` na API.
- Crie dois serviços a partir deste repositório: API usando `backend/Dockerfile` e Web usando `frontend/Dockerfile`; defina seus domínios HTTPS.
- Defina `FRONTEND_URL` na API e construa a Web com `NEXT_PUBLIC_API_URL=https://api.seudominio.com/api` e `NEXT_PUBLIC_SITE_URL=https://seudominio.com` (usado em metadados, `sitemap.xml`, `robots.txt` e na imagem de Open Graph).
- No frontend, mantenha `ADMIN_API_URL`, `ADMIN_API_TOKEN`, `ADMIN_PANEL_PASSWORD` e `ADMIN_SESSION_SECRET` somente no runtime. Nunca use `NEXT_PUBLIC_` para esses valores.
- No Next standalone, configure `HOSTNAME=0.0.0.0` e `PORT=3000` em runtime. Use `127.0.0.1`, não `localhost`, nos health checks internos.
- Hospede n8n como serviço separado, com volume persistente, `N8N_ENCRYPTION_KEY` e `WEBHOOK_URL` públicos. Configure `N8N_DELIVERY_WEBHOOK_URL` na API com a URL do webhook n8n.
- Use segredos longos e distintos para `N8N_SHARED_SECRET` e `INTERNAL_CALLBACK_SECRET`.
- Importe o fluxo descrito em [n8n/README.md](n8n/README.md), conecte Evolution API e Google Sheets e faça um envio de teste antes de divulgar o QR.

## Segurança e escopo

- Há validação de payload, normalização de telefone brasileiro, CORS restrito, rate limit, reserva transacional e endpoints internos protegidos por segredo.
- O painel `/admin` usa um BFF Next.js, sessão em cookie `HttpOnly` e token Bearer disponível somente no servidor. Operações administrativas relevantes geram auditoria no PostgreSQL.
- Um telefone recebe somente um cupom por campanha (normalizado para o formato de WhatsApp com DDD + 9 dígitos, fechando a brecha de digitar o número com e sem o 9 do celular); novos envios mostram o código originalmente emitido. Se os cupons já tiverem esgotado no primeiro envio, a resposta é salva mesmo assim, sem cupom, e reenvios continuam retornando esse mesmo resultado.
- A confirmação da Evolution significa solicitação/entrega ao provedor, não prova de titularidade do número. Isso exigiria OTP, fora deste MVP.
- Não há geração de QR code nem construtor visual de formulário nesta versão.

## Harness opcional do Codex

O projeto inclui um roteador local de tarefas em [ai/routing.json](ai/routing.json). A meta é gastar pouco sem usar um modelo fraco para mudanças críticas:

| Atividade | Agente padrão | Modo |
| --- | --- | --- |
| Explorar repositório, resumir logs/docs, planejar testes | Codex | somente leitura |
| Revisar um diff como segunda opinião | Codex | somente leitura |
| Implementar backend, frontend, depurar e rodar verificações | Codex | escrita no workspace |
| Arquitetura e análise de segurança | Codex | somente leitura |

1. O arquivo versionado `ai/models.example.json` define os perfis Codex. Para substituir algum ID disponível na sua conta sem alterar o Git, copie-o para `ai/models.local.json` e altere somente o campo necessário.
2. Faça uma prévia gratuita da rota:

   ```powershell
   .\scripts\ai-harness.ps1 -Task explore -Prompt 'Mapeie o fluxo de emissão de cupom'
   ```

3. Só execute depois de conferir a prévia:

   ```powershell
   .\scripts\ai-harness.ps1 -Task explore -Prompt 'Mapeie o fluxo de emissão de cupom' -Run
   .\scripts\ai-harness.ps1 -Task implement -Prompt 'Adicione validação X e execute os testes' -Run
   .\scripts\ai-harness.ps1 -Task frontend-implement -Prompt 'Implemente a tela a partir do design aprovado' -Run
   ```

O Codex pode executar todo o ciclo, inclusive `frontend-design` e `frontend-implement`. O procedimento está em [ai/SEQUENTIAL_WORKFLOW.md](ai/SEQUENTIAL_WORKFLOW.md). Use `review` depois de uma implementação importante e `security` antes de alterações em autenticação, LGPD, pagamentos ou integração com a Evolution API. As regras compartilhadas estão em [AGENTS.md](AGENTS.md).

## Sprints e entregas

O processo completo de implementação fica em [ai/sprints/README.md](ai/sprints/README.md): backlog priorizado, checklist de entrega e templates Codex. Para abrir uma próxima sprint:

```powershell
.\scripts\new-sprint.ps1 -Id '04' -Title 'Novo fluxo de campanha'
```

O fluxo de branches, CI, homologação e promoção para produção está em [DEVELOPMENT.md](DEVELOPMENT.md). Durante a reta final, implemente em `development`, valide o deploy e promova para `main` somente por PR.
