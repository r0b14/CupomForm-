import { ReactNode } from "react";
import { Campaign } from "../types";

type FormShellProps = {
  campaign: Campaign | null;
  step: number;
  totalSteps: number;
  previewMode: boolean;
  children: ReactNode;
};

export function FormShell({
  campaign,
  step,
  totalSteps,
  previewMode,
  children,
}: FormShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] px-5 py-11 font-[family-name:var(--font-manrope)]">
      <section className="mx-auto w-full max-w-[390px] overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(10,8,40,.35),0_4px_16px_rgba(10,8,40,.25)] transition-all">
        <header className="border-b border-[#efeef7] bg-[linear-gradient(180deg,#f5f4fb_0%,#fff_100%)] px-6 pb-[18px] pt-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eceafc] px-3 py-1.5 text-xs font-extrabold tracking-[.02em] text-[#4338ca]">
              <span className="size-1.5 rounded-full bg-[#4338ca] animate-pulse" />
              Pesquisa Gente Daqui
            </span>
            {previewMode && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1.5 text-[11px] font-extrabold text-amber-800">
                Demonstração local
              </span>
            )}
          </div>
          <h1 className="mt-3.5 text-[22px] font-extrabold leading-tight text-[#1b1830]">
            {campaign?.title || "Sua trajetória importa"}
          </h1>
          <p className="mt-1.5 text-[14.5px] leading-[1.5] text-[#6b6785]">
            {campaign?.subtitle ||
              "Responda algumas perguntas sobre trabalho e território e ganhe um cupom para usar no comércio local."}
          </p>
          <div className="mt-[18px]">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }, (_, index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    index + 1 <= step ? "bg-[#4338ca]" : "bg-[#e7e5f0]"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs font-extrabold text-[#6b6785]">
              Etapa {step} de {totalSteps}
            </p>
          </div>
        </header>

        {children}
      </section>
      <p className="mx-auto mt-5 max-w-[390px] text-center text-xs leading-5 text-white/35">
        CupomForm para o projeto Gente Daqui · conteúdo ilustrativo
      </p>
    </main>
  );
}
