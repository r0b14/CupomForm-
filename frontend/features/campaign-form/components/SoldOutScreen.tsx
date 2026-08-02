export function SoldOutScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] p-5 font-[family-name:var(--font-manrope)]">
      <section className="flex min-h-[620px] w-full max-w-[390px] flex-col items-center justify-center rounded-3xl bg-white px-7 text-center shadow-2xl">
        <span className="grid size-16 place-items-center rounded-full border border-[#e7e5f0] bg-[#f1f0f8] text-2xl text-[#8b87a8]">
          —
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-[#1b1830]">
          Cupons esgotados por aqui
        </h1>
        <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#6b6785]">
          Os cupons desta rodada de pesquisa já acabaram. Procure a equipe do Gente
          Daqui no seu território para saber sobre novas oportunidades.
        </p>
      </section>
    </main>
  );
}
