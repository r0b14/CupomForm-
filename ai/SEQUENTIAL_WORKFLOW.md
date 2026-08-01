# Fluxo sequencial: Codex primeiro, Gemini depois

Os CLIs são independentes. O harness **nunca** chama Codex e Gemini em sequência automaticamente; cada comando abaixo inicia apenas um agente no CLI correspondente.

## 1. Codex — backend e base técnica

Execute no Codex as tarefas de arquitetura, banco, API, integrações, testes e correções de backend.

```powershell
.\scripts\ai-harness.ps1 -Task architecture -Prompt 'Defina o contrato necessário para a funcionalidade X' -Run
.\scripts\ai-harness.ps1 -Task implement -Prompt 'Implemente a funcionalidade X no backend e rode os testes' -Run
```

Ao concluir, revise o diff e garanta que `npm test` e `npm run build` passaram. A entrega do Codex deve informar APIs alteradas, variáveis de ambiente e limites que o frontend precisa respeitar.

## 2. Gemini — design e frontend

Depois de concluir a etapa Codex, abra/executa o Gemini CLI em outra sessão. O Gemini só pode modificar `frontend/` e deve ler `frontend/FRONTEND_PROMPT.md` antes de começar.

```powershell
.\scripts\ai-harness.ps1 -Task frontend-design -Prompt 'Crie a especificação visual a partir de frontend/FRONTEND_PROMPT.md' -Run
.\scripts\ai-harness.ps1 -Task frontend-implement -Prompt 'Implemente o design aprovado. Não altere backend/.' -Run
```

Use Gemini 3.5 para exploração/revisão visual e Gemini 3.6 para design ou implementação completa. Caso o identificador `gemini-3.6-pro` da sua conta tenha outro sufixo, substitua somente `gemini.deep` em `ai/models.local.json`.

## 3. Revisão final

- Rode o build completo: `npm run build`.
- Confirme que mudanças de frontend não alteraram `backend/`.
- Use `review` apenas como segunda opinião em uma sessão Gemini separada.
