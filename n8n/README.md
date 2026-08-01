# Workflow: CupomForm → Evolution API → Google Sheets

Crie um workflow no n8n com os nós abaixo. Use credenciais do n8n para Google Sheets e mantenha URL/chaves da Evolution em credenciais, nunca em campos do workflow.

1. **Webhook**: `POST /webhook/cupom-delivery`; responda em modo "Using Respond to Webhook". Valide o header `x-cupomform-secret` contra `N8N_SHARED_SECRET`.
2. **HTTP Request — Evolution**: envie `POST` para o endpoint de texto da instância configurada pela sua versão da Evolution API. Destino: o campo `phone` do webhook, sem o `+`; mensagem sugerida: `Olá, {{ $json.name }}! Seu cupom é {{ $json.couponCode }}.`.
3. **Google Sheets — Append row**: grave `deliveryId`, `submissionId`, `couponCode`, `phone`, `name`, data/hora, e `SENT` (ou `FAILED`). Compartilhe a planilha somente com as pessoas autorizadas.
4. **HTTP Request — callback**: faça `PATCH {API_URL}/api/internal/deliveries/{deliveryId}`, com header `x-internal-secret: INTERNAL_CALLBACK_SECRET` e corpo `{ "status": "SENT", "providerMessageId": "..." }`. No ramo de erro, use `{ "status": "FAILED", "error": "..." }`.
5. **Respond to Webhook**: responda HTTP 200 apenas depois de acionar o fluxo. A API então marca a solicitação como `DISPATCHED`; o callback a finaliza como `SENT` ou `FAILED`.

## Colunas sugeridas

`delivery_id`, `submission_id`, `coupon_code`, `name`, `phone`, `requested_at`, `delivery_status`, `provider_message_id`.

O PostgreSQL é a fonte de verdade. A planilha é um espelho operacional e não deve ser usada para decidir qual cupom entregar.
