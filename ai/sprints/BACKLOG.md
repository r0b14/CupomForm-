# Backlog priorizado

## P0 — necessário para publicar a primeira campanha

- [ ] Configurar dados reais da campanha, termo de privacidade e lote de cupons.
- [ ] Validar API e emissão concorrente de cupom contra PostgreSQL real.
- [x] Concluir o workflow n8n: credencial Google configurada, Evolution + Sheets testados e workflow ativado.
- [ ] Criar e aprovar design mobile no Stitch ou Claude Design.
- [x] Implementar frontend final e verificar os estados locais de carregamento, formulário, cupom, falha e esgotado.
- [x] Finalizar publicação técnica de homologação: Web/API/PostgreSQL/n8n saudáveis e fluxo público validado de ponta a ponta.

## P1 — confiabilidade depois do lançamento

- [ ] Retentativa/alerta para falhas de envio WhatsApp.
- [x] Métricas de estoque, emissão e entrega de cupom.
- [x] Página/rotina interna para importação segura de lote de cupons.
- [ ] Revisar texto LGPD e acessos à planilha com responsável jurídico.

## P2 — fora do MVP

- [ ] Múltiplas campanhas e QR com slug.
- [x] Painel administrativo conectado à API publicada com autenticação de servidor.
- [x] Definir contrato seguro do painel administrativo: token Bearer, métricas, campanhas, cupons, respostas, entregas e auditoria.
- [x] Implementar backend administrativo antes de conectar o frontend aos dados reais.
- [ ] Verificação de propriedade do telefone por OTP.
- [x] Dashboard de respostas e exportação.
