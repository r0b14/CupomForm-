# Sprint 04 — descontos e mensagem do parceiro

**Status:** implementação concluída; aguardando publicação do workflow e aceite humano
**Objetivo:** distribuir cupons de 5% e 10% em proporção 50/50 enquanto houver estoque dos dois tipos e enviar pelo WhatsApp uma mensagem completa, coerente com o código atribuído.
**Fora do escopo:** múltiplos parceiros, editor visual da mensagem, alteração do frontend e verificação OTP do telefone.

## Decisões

- Códigos válidos seguem `GENTE-005-*` para 5% e `GENTE-010-*` para 10%.
- O backend sorteia o tipo com chance 50/50 dentro da transação; se o tipo sorteado estiver esgotado, usa o outro.
- O desconto enviado ao n8n é derivado e validado pelo código do cupom, não escolhido pelo frontend.
- Parceiro: Hortifruti Moranguinho, R. Cabo Eutrópio, 177 - São José, Recife - PE, 50080-180.
- Validade: 16/08/2026. O cupom é intransferível, vinculado a nome e telefone e deve ser apresentado no WhatsApp no pagamento.

## Critérios de aceite

- [x] Importação administrativa aceita apenas os padrões `GENTE-005-*` e `GENTE-010-*`.
- [x] Com estoque dos dois tipos, cada nova emissão sorteia 5% ou 10%; sem um tipo, usa o estoque restante.
- [x] Reserva continua atômica com `FOR UPDATE SKIP LOCKED` e repetição do telefone mantém o cupom original.
- [x] Payload de entrega contém o percentual derivado do código.
- [x] WhatsApp informa percentual, código, parceiro, endereço, mapa, validade e regras de uso.
- [x] Testes e build passam; workflow JSON é válido.

## Etapa Codex

| Tarefa | Rota/modelo | Arquivos permitidos | Aceite |
| --- | --- | --- | --- |
| Seleção e validação de cupons | `implement` / Terra | `backend/` | Testes de 5%, 10%, fallback e atomicidade passam |
| Mensagem operacional | `implement` / Terra | `n8n/`, documentação | JSON válido e checklist de publicação registrada |

## Handoff Codex → Gemini

Não aplicável: esta sprint não altera `frontend/`.

## Entrega humana

- [ ] Importar quantidades adequadas de `GENTE-005-*` e `GENTE-010-*` pelo painel.
- [ ] Reimportar/publicar o workflow ou ajustar o nó **Preparar envio** no n8n.
- [ ] Fazer dois ou mais envios controlados e conferir texto, desconto, callback e painel.
- [x] Sem segredos/PII no diff ou nos prompts.

## Evidências Codex — 02/08/2026

- Produção atualizada para servir `SCALE` nas perguntas `confianca_programa` e `sentido_para_vida`; seed executado com `SEED_DEV_COUPONS=false` e API pública conferida.
- `npm test`: 8 arquivos e 30 testes aprovados.
- `npm run build`: frontend Next.js e backend NestJS aprovados.
- Workflow `CupomFormDelivery01` analisado como JSON válido, com validação de `discountPercent` e mensagem completa do parceiro.
- `git diff --check`: aprovado.
