import { Result, DeliveryState } from "../types";

type CouponScreenProps = {
  result: Result;
  deliveryState: DeliveryState;
  requestError: string;
  onRequestDelivery: () => void;
};

export function CouponScreen({
  result,
  deliveryState,
  requestError,
  onRequestDelivery,
}: CouponScreenProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#2a2470_0%,#171545_55%,#0b0a1f_100%)] px-5 py-11 font-[family-name:var(--font-manrope)]">
      <section className="mx-auto flex min-h-[660px] w-full max-w-[390px] flex-col rounded-3xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between">
          <div className="grid size-14 place-items-center rounded-full bg-[#ecf8f3] text-2xl font-bold text-[#059669] shadow-sm">
            ✓
          </div>
          <span className="rounded-full bg-[#ecf8f3] px-3 py-1 text-xs font-extrabold text-[#059669]">
            Gerado com sucesso
          </span>
        </div>
        <div className="mt-5">
          <h1 className="text-[22px] font-extrabold text-[#1b1830]">
            Seu cupom chegou!
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6b6785]">
            Obrigado por participar. Use o código abaixo em comércios parceiros do
            seu território.
          </p>
        </div>
        <div className="mt-6 flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-[#4338ca] bg-[#f7f6fc] p-5 shadow-inner">
          <span className="text-[11.5px] font-extrabold uppercase tracking-[.08em] text-[#6b6785]">
            Seu código de desconto
          </span>
          <strong className="text-3xl font-extrabold tracking-[.08em] text-[#4338ca]">
            {result.couponCode}
          </strong>
        </div>
        <p className="mt-4 text-[13px] leading-5 text-[#6b6785]">
          Válido em comércios locais parceiros · uma vez por pessoa. Este código
          também pode chegar no seu WhatsApp.
        </p>
        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={onRequestDelivery}
            disabled={deliveryState !== "idle"}
            className={`h-14 w-full rounded-2xl text-[15px] font-extrabold transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed ${
              deliveryState === "sent"
                ? "border-[1.5px] border-[#059669] bg-[#ecf8f3] text-[#059669]"
                : "bg-[#059669] text-white hover:bg-[#047857] shadow-md hover:shadow-lg disabled:opacity-70"
            }`}
          >
            {deliveryState === "sending"
              ? "Solicitando envio…"
              : deliveryState === "sent"
              ? "Solicitação enviada"
              : "Enviar para meu WhatsApp"}
          </button>
          {deliveryState === "sent" && (
            <p className="mt-3 text-center text-[12.5px] text-[#6b6785]">
              Você vai receber uma mensagem no WhatsApp em instantes.
            </p>
          )}
          {requestError && (
            <p
              role="alert"
              className="mt-3 text-center text-[12.5px] font-bold text-red-600"
            >
              {requestError}
            </p>
          )}
        </div>
      </section>
      <p className="mx-auto mt-5 max-w-[390px] text-center text-xs leading-5 text-white/35">
        CupomForm para o projeto Gente Daqui
      </p>
    </main>
  );
}
