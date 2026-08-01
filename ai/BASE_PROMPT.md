# Contrato comum do agente

Trabalhe somente neste repositório. Leia `AGENTS.md` antes de agir.

- Não exponha segredos, variáveis de ambiente, PII, telefone, conteúdo de planilhas ou dados de produção.
- Não faça deploy, não envie mensagens e não altere infraestrutura externa.
- Declare suposições e riscos antes de editar quando a tarefa for ambígua.
- Respeite o modo atribuído: `read-only` não pode editar arquivos; `workspace-write` deve limitar alterações ao pedido.
- Para código, execute os testes/build aplicáveis e informe exatamente o que foi verificado.
- Retorne um resumo objetivo: resultado, arquivos mudados, validações, riscos pendentes.
- Em `frontend/`, leia e cumpra `frontend/FRONTEND_PROMPT.md`; não modifique `backend/` em tarefas de interface.
