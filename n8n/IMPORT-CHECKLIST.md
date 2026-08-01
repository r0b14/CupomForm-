# Importação do workflow n8n

Arquivo para importar: [`workflows/cupomform-delivery.json`](workflows/cupomform-delivery.json).

## Antes de importar

1. Crie uma planilha Google com uma aba (por exemplo, `entregas`) e a primeira linha exatamente assim:

   `delivery_id`, `submission_id`, `coupon_code`, `name`, `phone`, `requested_at`, `delivery_status`, `provider_message_id`, `error`

2. Na nova workspace do n8n, cadastre a credencial **Google Sheets OAuth2 API**. Ela é a única credencial escolhida visualmente no fluxo; nenhuma chave está no JSON.

3. Defina estas variáveis de ambiente no serviço n8n. Os valores marcados como “igual” devem ser idênticos aos do backend:

   | Variável | Valor |
   | --- | --- |
   | `N8N_SHARED_SECRET` | segredo longo, igual ao backend |
   | `INTERNAL_CALLBACK_SECRET` | segredo longo diferente, igual ao backend |
   | `CUPOMFORM_API_URL` | URL pública da API, sem `/api` no fim |
   | `EVOLUTION_API_URL` | URL base da Evolution API, sem barra final |
   | `EVOLUTION_INSTANCE` | nome da instância Evolution |
   | `EVOLUTION_API_KEY` | chave da Evolution API |
   | `GOOGLE_SHEETS_DOCUMENT_ID` | ID da planilha (trecho entre `/d/` e `/edit`) |
   | `GOOGLE_SHEETS_SHEET_NAME` | nome da aba, por exemplo `entregas` |

## No n8n

1. Entre na workspace nova e escolha **Import from File**.
2. Selecione `n8n/workflows/cupomform-delivery.json`.
3. Abra o nó **Google Sheets - auditoria**, escolha a credencial Google criada e confirme a planilha/aba.
4. Abra o nó **Evolution API - enviar texto** e confirme o endpoint de sua versão da Evolution. O fluxo está preparado para o padrão v2: `POST /message/sendText/{instância}` com `apikey`, `number` e `text`.
5. Salve e ative o workflow. A URL de produção passa a ser `https://SEU-N8N/webhook/cupom-delivery`.

## Teste controlado

Com a API publicada, use o Swagger em `https://SUA-API/api/docs`:

1. Crie uma submissão em `POST /api/submissions`.
2. Use o `submissionId` retornado em `POST /api/submissions/{id}/delivery`.
3. Verifique no n8n uma execução com status `SENT` ou `FAILED`, a linha na planilha e o status da entrega no banco.

O webhook responde `200 {"accepted":true}` imediatamente. O envio, callback e auditoria continuam no mesmo workflow; por isso a tela do formulário não fica aguardando a Evolution API.

## Segurança operacional

- Não coloque chaves, IDs de planilha ou URLs privadas no arquivo de workflow.
- Mantenha o workflow inativo até todas as variáveis e a credencial Google estarem configuradas.
- O PostgreSQL é a fonte de verdade; a planilha é somente auditoria operacional.
