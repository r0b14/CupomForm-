// O bairro é perguntado junto com nome e WhatsApp (etapa de identificação) e
// mostra só as opções prioritárias até a pessoa expandir a lista completa.
export const NEIGHBORHOOD_QUESTION_KEY = "bairro";
export const NEIGHBORHOOD_VISIBLE_COUNT = 3;

// Tempo mínimo da tela de abertura. A campanha é buscada em paralelo, então isso
// não soma latência: só garante que a animação seja vista por inteiro.
export const SPLASH_DURATION_MS = 2400;
// Fade-out do splash antes de revelar o card.
export const SPLASH_EXIT_MS = 320;
