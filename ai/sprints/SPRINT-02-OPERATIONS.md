# Sprint 02 — operação, observabilidade e recuperação

**Status:** backlog planejado  
**Objetivo:** tornar a campanha operável após o lançamento sem ampliar o produto para um painel administrativo completo.

## Etapa Codex — infraestrutura e confiabilidade

- [ ] Definir eventos e métricas: cupons disponíveis, emissões, solicitações e falhas de entrega.
- [ ] Implementar retentativa segura ou rotina de reconciliação para status `FAILED`.
- [ ] Documentar backup PostgreSQL, rotação de segredos e recuperação do n8n.
- [ ] Revisar acesso interno e rate limits.

**Rota:** `architecture` (Sol) para decisão, depois `implement`/`debug` (Terra).

## Etapa Gemini — operação de interface

- [ ] Revisar mensagens de erro e suporte para os incidentes reais observados.
- [ ] Implementar somente ajustes em `frontend/` aprovados após o backend estar estável.
- [ ] Revisar visualmente os estados de indisponibilidade e reenvio.

**Rota:** `frontend-implement` (Gemini 3.6), seguida de `review` (Gemini 3.5).

## Aceite

- [ ] Falhas de WhatsApp podem ser identificadas e tratadas sem perda de cupom.
- [ ] Equipe consegue identificar estoque baixo e falhas de integração.
- [ ] Nenhuma PII aparece em logs ou relatórios de diagnóstico.
