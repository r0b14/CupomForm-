# Importação do workflow n8n

Arquivo para importar: [`workflows/cupomform-delivery.json`](workflows/cupomform-delivery.json).

Depois da importação, confirme que o workflow se chama **CupomForm - Evolution + Google Sheets**. Instalações anteriores podem conter um fluxo obsoleto chamado **CupomForm - Entrega de cupom**; mantenha-o inativo.

## Atualização do formulário de 19 perguntas

Antes de reimportar o workflow em uma instalação que ainda usa a versão antiga:

1. Desative temporariamente o workflow `CupomFormDelivery01`.
2. Na aba `entregas`, preserve a linha 1 e apague todas as linhas de dados a partir da linha 2.
3. Na aba `respostas`, apague todas as linhas existentes e cole na célula `A1` a linha de cabeçalhos abaixo. Os valores estão separados por tabulação e devem ocupar 27 colunas:

   ```text
   submission_id	name	phone	created_at	coupon_code	delivery_status	idade	bairro	situacao_atual	oportunidade_recente	barreira	motivo_participacao	area_interesse	apoio_primeiro_passo	tempo_preparacao	referencia_local	referencia_nome_profissao	influencia_decisao	confianca_programa	sentido_para_vida	participaria	canal_acompanhamento	fator_permanencia	frequencia_acompanhamento	motivo_desistencia	answers_json	synced_at
   ```

4. Reimporte [`workflows/cupomform-delivery.json`](workflows/cupomform-delivery.json), substituindo o workflow de ID `CupomFormDelivery01`.
5. Confirme novamente a credencial Google nos nós `Google Sheets - auditoria` e `Google Sheets - espelho de respostas`.
6. Ative o workflow e execute `Sincronizar agora` uma vez. Com o banco recém-limpo, a aba `respostas` deve continuar somente com o cabeçalho.

## Antes de importar

1. Crie uma planilha Google com duas abas. Na aba `entregas`, use a primeira linha exatamente assim:

   `delivery_id`, `submission_id`, `coupon_code`, `name`, `phone`, `requested_at`, `delivery_status`, `provider_message_id`, `error`

   Na aba `respostas`, use a primeira linha exatamente assim:

   `submission_id`, `name`, `phone`, `created_at`, `coupon_code`, `delivery_status`, `idade`, `bairro`, `situacao_atual`, `oportunidade_recente`, `barreira`, `motivo_participacao`, `area_interesse`, `apoio_primeiro_passo`, `tempo_preparacao`, `referencia_local`, `referencia_nome_profissao`, `influencia_decisao`, `confianca_programa`, `sentido_para_vida`, `participaria`, `canal_acompanhamento`, `fator_permanencia`, `frequencia_acompanhamento`, `motivo_desistencia`, `answers_json`, `synced_at`

2. Na workspace do n8n, cadastre a credencial **Google Service Account API** com o e-mail e a chave privada do JSON baixado no Google Cloud. Compartilhe a planilha com o e-mail da conta de serviço. Ela é a única credencial escolhida visualmente no fluxo; nenhuma chave fica no JSON versionado.

3. Defina estas variáveis de ambiente no serviço n8n. Os valores marcados como “igual” devem ser idênticos aos do backend:

   | Variável                             | Valor                                                       |
   | ------------------------------------ | ----------------------------------------------------------- |
   | `N8N_SHARED_SECRET`                  | segredo longo, igual ao backend                             |
   | `INTERNAL_CALLBACK_SECRET`           | segredo longo diferente, igual ao backend                   |
   | `ADMIN_API_TOKEN`                    | token administrativo, igual ao backend e ao BFF do frontend |
   | `CUPOMFORM_API_URL`                  | URL pública da API, sem `/api` no fim                       |
   | `EVOLUTION_API_URL`                  | URL base da Evolution API, sem barra final                  |
   | `EVOLUTION_INSTANCE`                 | nome da instância Evolution                                 |
   | `EVOLUTION_API_KEY`                  | chave da Evolution API                                      |
   | `GOOGLE_SHEETS_DOCUMENT_ID`          | ID da planilha (trecho entre `/d/` e `/edit`)               |
   | `GOOGLE_SHEETS_SHEET_NAME`           | nome da aba, por exemplo `entregas`                         |
   | `GOOGLE_SHEETS_RESPONSES_SHEET_NAME` | nome da aba, por exemplo `respostas`                        |

   Como este workflow usa `$env` nas expressões, configure também `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`. Faça isso apenas nesta instância controlada e importe somente workflows confiáveis.

## No n8n

1. Entre na workspace nova e escolha **Import from File**.
2. Selecione `n8n/workflows/cupomform-delivery.json`.
3. Nos nós **Google Sheets - auditoria** e **Google Sheets - espelho de respostas**, escolha a mesma credencial Google e confirme a planilha/aba correspondente.
   Se a planilha já existe, atualize os cabeçalhos da aba `respostas` para a linha acima antes de ativar este workflow.
4. Abra o nó **Evolution API - enviar texto** e confirme o endpoint de sua versão da Evolution. O fluxo está preparado para o padrão v2: `POST /message/sendText/{instância}` com `apikey`; em **Specify Body**, use **Using Fields Below** com os campos `number={{ $json.phone }}` e `text={{ $json.message }}`.
5. Execute manualmente pelo gatilho **Sincronizar agora** e confirme que as submissões existentes aparecem uma única vez na aba `respostas`.
6. Salve e ative o workflow. A URL de produção passa a ser `https://SEU-N8N/webhook/cupom-delivery`, e o espelho é atualizado a cada cinco minutos.

## Teste controlado

Com a API publicada, use o Swagger em `https://SUA-API/api/docs`:

1. Crie uma submissão em `POST /api/submissions`.
2. Use o `submissionId` retornado em `POST /api/submissions/{id}/delivery`.
3. Verifique no n8n uma execução com status `SENT` ou `FAILED`, a linha na aba `entregas` e o status da entrega no banco.
4. Execute **Sincronizar agora** e confira a submissão na aba `respostas`; uma segunda execução deve atualizar a mesma linha, não duplicá-la.

O webhook responde `200 {"accepted":true}` imediatamente. O envio, callback e auditoria continuam no mesmo workflow; por isso a tela do formulário não fica aguardando a Evolution API.

## Segurança operacional

- Não coloque chaves, IDs de planilha ou URLs privadas no arquivo de workflow.
- Mantenha o workflow inativo até todas as variáveis e a credencial Google estarem configuradas.
- O PostgreSQL é a fonte de verdade; a planilha é somente auditoria operacional.
