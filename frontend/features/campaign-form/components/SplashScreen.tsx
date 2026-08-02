import { CSSProperties } from "react";
import { SPLASH_DURATION_MS } from "../constants";

type SplashScreenProps = {
  /** Dispara o fade-out logo antes do formulário entrar. */
  leaving: boolean;
};

// Distribuídas ao longo da duração do splash para a espera parecer progresso.
const MESSAGES = [
  "Preparando sua pesquisa…",
  "Separando seu cupom…",
  "Quase lá…",
];

export function SplashScreen({ leaving }: SplashScreenProps) {
  const messageSlot = SPLASH_DURATION_MS / MESSAGES.length;

  return (
    <main
      className={`relative grid min-h-screen place-items-center bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] px-6 py-11 font-[family-name:var(--font-manrope)] ${
        leaving ? "animate-splash-out" : ""
      }`}
    >
      <div className="flex w-full max-w-[390px] flex-col items-center">
        <div className="relative grid size-[86px] place-items-center">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full animate-splash-orbit"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,.12)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#a9a4ff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="70 206"
            />
          </svg>
          <span className="size-3.5 rounded-full bg-[#a9a4ff] animate-pulse" />
        </div>

        <span
          className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold tracking-[.02em] text-[#d8d5ff] animate-splash-rise"
          style={{ animationDelay: "80ms" }}
        >
          <span className="size-1.5 rounded-full bg-[#a9a4ff]" />
          Pesquisa Gente Daqui
        </span>

        <h1
          className="mt-4 text-center text-[22px] font-extrabold leading-tight text-white animate-splash-rise"
          style={{ animationDelay: "200ms" }}
        >
          Seu cupom está chegando
        </h1>

        <div
          className="mt-6 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10 animate-splash-rise"
          style={{ animationDelay: "320ms" }}
        >
          <div
            className="h-full w-full rounded-full bg-[linear-gradient(90deg,#6c63ff,#a9a4ff)] animate-splash-progress"
            style={
              {
                "--splash-duration": `${SPLASH_DURATION_MS}ms`,
              } as CSSProperties
            }
          />
        </div>

        {/* Empilhadas no mesmo espaço: cada uma entra e sai na sua fatia de tempo. */}
        <div
          role="status"
          aria-live="polite"
          className="relative mt-4 h-5 w-full text-center"
        >
          {MESSAGES.map((message, index) => {
            // A última fica fixa: se a API demorar mais que o splash, o texto
            // continua no ar em vez de deixar um vazio.
            const isLast = index === MESSAGES.length - 1;
            return (
              <span
                key={message}
                className={`absolute inset-0 text-[13px] font-bold text-white/55 ${
                  isLast ? "animate-splash-rise" : "animate-splash-message"
                }`}
                style={
                  {
                    "--splash-message-duration": `${messageSlot}ms`,
                    animationDelay: `${index * messageSlot}ms`,
                  } as CSSProperties
                }
              >
                {message}
              </span>
            );
          })}
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-8 px-6 text-center text-xs leading-5 text-white/30">
        CupomForm para o projeto Gente Daqui · Potencializando iniciativas Locais
      </p>
    </main>
  );
}
