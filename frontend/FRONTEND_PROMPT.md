# Prompt mestre — criar o front-end do CupomForm

Use este texto no Google Stitch ou Claude Design para gerar a direção visual. Depois, o **Gemini CLI** deve implementar o resultado exclusivamente em `frontend/`, usando Next.js 15, React 19 e Tailwind CSS 4.

---

Crie o design de uma landing page mobile-first chamada **CupomForm**. O usuário chega por QR Code para responder uma pesquisa curta e receber um cupom de desconto exclusivo.

## Público e objetivo

- Público brasileiro, usando o celular em pé, muitas vezes dentro de uma loja ou evento.
- O percurso precisa levar menos de dois minutos: identificar-se, responder três perguntas, aceitar privacidade e visualizar o cupom.
- A experiência deve transmitir confiança, simplicidade e benefício imediato — nunca parecer um formulário burocrático.

## Direção visual

- Estilo: campanha promocional premium, amigável e contemporânea; evitar aparência corporativa fria ou visual de cassino.
- Fundo em gradiente índigo profundo para azul-noite; superfícies brancas; ação principal índigo; sucesso/WhatsApp em verde-esmeralda.
- Tipografia sem serifa, alta legibilidade, contraste AA e alvos de toque mínimos de 44 px.
- Largura prioritária 360–430 px, com expansão elegante para desktop. Muito espaço em branco, cartões com raio de 24 px e sombras suaves.
- Não use imagens de pessoas, QR Codes ou logos de marcas fictícias. Use ícones simples apenas quando ajudam a compreensão.

## Telas e estados obrigatórios

1. **Carregamento:** tela limpa com indicador discreto e texto “Carregando campanha…”.
2. **Formulário:** cabeçalho com selo “Campanha especial”, título da campanha e subtítulo; campos Nome e WhatsApp; perguntas configuráveis com alternativas grandes e textarea; checkbox de consentimento; CTA “Quero meu cupom”.
3. **Validação/erro:** campo com borda e mensagem objetiva; preservar o que o usuário já preencheu.
4. **Cupom emitido:** ícone de sucesso, mensagem “Seu cupom chegou”, código em destaque dentro de borda tracejada, explicação curta e CTA “Enviar para meu WhatsApp”.
5. **Envio solicitado:** o mesmo CTA passa para estado de confirmação; não prometa que o WhatsApp foi lido, apenas que a solicitação foi enviada.
6. **Estoque esgotado:** estado respeitoso, sem cupom e com instrução curta para procurar o estabelecimento.

## Regras de implementação para Gemini

- Trabalhe apenas em `frontend/`; não altere `backend/`, banco, Docker ou fluxo n8n.
- Não invente endpoints nem persista dados no browser. Consuma a API configurada por `NEXT_PUBLIC_API_URL`.
- A página deve usar `GET /api/campaign` para título, subtítulo, texto de privacidade e perguntas.
- Ao enviar, use `POST /api/submissions` com `{ name, phone, answers, consent }`. A resposta contém `{ submissionId, couponCode, isExisting }`.
- Para o botão final, use `POST /api/submissions/:id/delivery`; `202` significa que o envio foi solicitado.
- As perguntas de `SINGLE_CHOICE` usam `options`; as de `TEXT` são textarea. Campos `required` devem ser exigidos tanto visualmente quanto pelo formulário HTML.
- Criar estados de loading, erro de rede, resposta inválida, cupom repetido e estoque esgotado. Não expor detalhes internos da API.
- Não adicionar bibliotecas visuais sem necessidade. Priorizar Tailwind, componentes pequenos, acessibilidade e HTML semântico.
- Reutilizar os tokens de cor, fonte, raios e sombra definidos em `tailwind.config.ts`; não criar uma paleta paralela.
- Ao terminar, executar `npm run build -w @cupomform/frontend` e relatar os arquivos modificados.

## Entrega esperada do design

Forneça uma tela principal mobile, a tela de cupom emitido e os estados de erro/esgotado. Defina tokens de cor, escala tipográfica, espaçamento, componentes de campo, botão e cartão de cupom para que a implementação em Tailwind seja direta.
