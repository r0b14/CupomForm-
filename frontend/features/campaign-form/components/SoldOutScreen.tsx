export function SoldOutScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] p-5 font-[family-name:var(--font-manrope)]">
      <section className="flex min-h-[620px] w-full max-w-[390px] flex-col items-center justify-center rounded-3xl bg-white px-7 text-center shadow-2xl animate-card-in">
        <span className="grid size-16 place-items-center rounded-full bg-[#ecf8f3] text-2xl font-bold text-[#059669] shadow-sm">
          ✓
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-[#1b1830]">
          Obrigado por participar!
        </h1>
        <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#6b6785]">
          Suas respostas foram registradas com sucesso. Os cupons desta rodada
          já esgotaram, mas assim que surgir uma nova oportunidade você será
          avisado pelo seu WhatsApp.
        </p>
        <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#6b6785]">
          Acompanhe as nossas redes sociais para ficar sabendo das próximas
          oportunidades.
        </p>
        <a
          href="https://www.instagram.com/gente_daqui0?igsh=MWtiN2RkenJiYjhidg=="
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/promo_banner.webp"
            alt="Promo Banner"
            className="mt-3 rounded-2xl max-w-70"
          />
        </a>
      </section>
    </main>
  );
}
