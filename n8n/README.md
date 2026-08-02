# n8n — Evolution + Google Sheets

O fluxo importável está em [`workflows/cupomform-delivery.json`](workflows/cupomform-delivery.json). Ele possui dois caminhos no mesmo workflow:

- entrega em tempo real: valida o webhook, responde à API, envia o cupom pela Evolution, atualiza o status e registra a auditoria;
- espelho operacional: a cada cinco minutos consulta todas as submissões na API administrativa e faz `append or update` na aba `respostas`, usando `submission_id` como chave.

Siga a [checklist de importação](IMPORT-CHECKLIST.md) antes de ativá-lo. O arquivo não contém credenciais, chaves ou URLs do seu ambiente.

O PostgreSQL é a fonte de verdade. As abas `entregas` e `respostas` são espelhos operacionais e nunca decidem a emissão ou entrega de cupons.

O envio pela Evolution não possui retentativa automática para evitar WhatsApp duplicado quando o provedor recebe a mensagem, mas a conexão é interrompida antes da resposta. Falhas ficam registradas na API e podem ser reenviadas de forma consciente pelo painel administrativo. Consulta, callback e espelho por `submission_id` possuem retentativas porque são operações idempotentes.

No n8n, a versão atual aparece como **CupomForm - Evolution + Google Sheets** e possui o ID fixo `CupomFormDelivery01`. Não ative workflows antigos chamados **CupomForm - Entrega de cupom**.

## Estado validado em produção

Em 02/08/2026, o workflow foi validado de ponta a ponta: webhook autenticado, envio `sendText` aceito pela Evolution, callback persistido como `SENT`, painel administrativo atualizado e abas `entregas`/`respostas` sincronizadas. No nó **Evolution API - enviar texto**, o corpo usa campos separados `number` e `text` para evitar erros de serialização de JSON.

O backend envia `discountPercent`, derivado do segmento `005`/`010` do código. O workflow valida esse valor e o usa na mensagem do Hortifruti Moranguinho, junto com endereço, mapa, validade e regras; assim o percentual comunicado sempre corresponde ao cupom reservado.
