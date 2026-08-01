# Backlog priorizado

## P0 — necessário para publicar a primeira campanha

- [ ] Configurar dados reais da campanha, termo de privacidade e lote de cupons.
- [ ] Validar API e emissão concorrente de cupom contra PostgreSQL real.
- [ ] Configurar workflow n8n com Evolution API e Google Sheets.
- [ ] Criar e aprovar design mobile no Stitch ou Claude Design.
- [x] Implementar frontend final e verificar os estados locais de carregamento, formulário, cupom, falha e esgotado.
- [ ] Finalizar publicação: Web/API/PostgreSQL concluídos; configurar n8n e testar URL pública de ponta a ponta.

## P1 — confiabilidade depois do lançamento

- [ ] Retentativa/alerta para falhas de envio WhatsApp.
- [ ] Métricas de estoque, emissão e entrega de cupom.
- [ ] Página/rotina interna para importação segura de lote de cupons.
- [ ] Revisar texto LGPD e acessos à planilha com responsável jurídico.

## P2 — fora do MVP

- [ ] Múltiplas campanhas e QR com slug.
- [ ] Painel administrativo.
- [ ] Definir contrato seguro do painel administrativo: autenticação, perfis, métricas, campanhas, cupons, respostas, entregas e auditoria.
- [ ] Implementar backend administrativo com Codex antes de conectar o frontend desenhado no Claude Design/Gemini.
- [ ] Verificação de propriedade do telefone por OTP.
- [ ] Dashboard de respostas e exportação.
