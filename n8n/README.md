# n8n — entrega de cupom

O fluxo importável está em [`workflows/cupomform-delivery.json`](workflows/cupomform-delivery.json). Ele faz a validação do webhook, responde rapidamente à API, solicita o envio pela Evolution, atualiza a entrega na API e registra a auditoria no Google Sheets.

Siga a [checklist de importação](IMPORT-CHECKLIST.md) antes de ativá-lo. O arquivo não contém credenciais, chaves ou URLs do seu ambiente.

O PostgreSQL é a fonte de verdade. A planilha é apenas um espelho operacional e nunca decide a entrega de cupons.
