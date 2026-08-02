type UnavailableScreenProps = {
  requestError?: string;
};

export function UnavailableScreen({ requestError }: UnavailableScreenProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0a1f] p-5 font-[family-name:var(--font-manrope)]">
      <section className="w-full max-w-[390px] rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#f1f0f8] text-2xl text-[#6b6785]">
          !
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-[#1b1830]">
          Campanha indisponível
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6b6785]">
          {requestError ||
            "Não foi possível carregar a campanha. Tente novamente em instantes."}
        </p>
      </section>
    </main>
  );
}
