# Fluxo de desenvolvimento

## Branches

| Branch                        | Finalidade                                   | Deploy                                                          |
| ----------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| `main`                        | versão aprovada para entrega                 | produção                                                        |
| `development`                 | integração e homologação das mudanças finais | homologação; temporariamente ligada ao serviço atual no Coolify |
| `feat/<nome>` ou `fix/<nome>` | trabalho isolado e curto                     | sem deploy permanente; opcionalmente preview                    |

`main` não recebe desenvolvimento direto. O caminho normal é:

```text
feat/* ou fix/* → development → main
```

## Ciclo curto para a entrega atual

1. Atualize a base: `git switch development` e `git pull --ff-only`.
2. Para uma mudança pequena e urgente, trabalhe em `development`; para algo arriscado, abra `feat/<nome>` a partir dela.
3. Backend e infraestrutura são implementados pelo Codex. Mudanças em `frontend/` passam pela rota `frontend-implement` do Gemini.
4. Antes de enviar, execute `npm test` e `npm run build`.
5. Faça commit pequeno, envie a branch e aguarde o CI `Tests and builds`.
6. Valide o deploy de homologação no Coolify: health checks, formulário público e `/admin`.
7. Quando o aceite final passar, abra PR de `development` para `main`, faça merge e publique `main` em produção.

## Regra temporária do Coolify

O recurso público `cupomform-web` foi apontado temporariamente para `development`. Enquanto isso, qualquer push direto nessa branch pode chegar ao domínio público. Evite commits parciais e só envie depois de testes/build locais.

Ao finalizar a entrega:

1. faça merge de `development` em `main` por PR;
2. altere o Git Source do serviço de produção para `main`;
3. faça redeploy e confirme o SHA do merge;
4. mantenha `development` em um recurso/domínio separado se houver continuidade do projeto.

## Hotfix

Correção crítica de produção nasce de `main` em `fix/<nome>`, volta para `main` por PR e depois é incorporada em `development`, evitando que a correção desapareça na próxima entrega.

## Segredos e banco

- Não copie segredos de produção para arquivos, prompts ou logs.
- Um ambiente de homologação duradouro deve ter PostgreSQL e credenciais próprios.
- Enquanto `development` usar a infraestrutura de produção, não teste importação, alteração de campanha ou reenvio com dados descartáveis.
- Migrações Prisma nunca são reescritas depois de aplicadas; sempre crie uma nova migração.
