# Fluxo de trabalho: Codex

O Codex é responsável por arquitetura, backend, frontend, integrações, testes e revisão. O harness inicia somente um processo Codex por comando e é opcional quando o agente principal já está executando a tarefa.

## 1. Planejamento e implementação

Use as rotas de arquitetura e implementação quando houver delegação para outro processo Codex.

```powershell
.\scripts\ai-harness.ps1 -Task architecture -Prompt 'Defina o contrato necessário para a funcionalidade X' -Run
.\scripts\ai-harness.ps1 -Task implement -Prompt 'Implemente a funcionalidade X no backend e rode os testes' -Run
```

Ao concluir, revise o diff e garanta que `npm test` e `npm run build` passaram. A entrega do Codex deve informar APIs alteradas, variáveis de ambiente e limites que o frontend precisa respeitar.

## 2. Revisão final

- Rode o build completo: `npm run build`.
- Revise em conjunto os contratos entre frontend, backend e integrações.
- Use `review` apenas quando uma segunda passagem trouxer valor real.
