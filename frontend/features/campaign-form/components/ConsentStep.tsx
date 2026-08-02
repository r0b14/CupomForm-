import { FieldErrors } from "../types";

type ConsentStepProps = {
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  privacyText?: string;
  errors: FieldErrors;
};

export function ConsentStep({
  consent,
  onConsentChange,
  privacyText,
  errors,
}: ConsentStepProps) {
  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#f7f6fc] border border-[#e7e5f0] p-4 transition-all hover:bg-[#efeefc] hover:border-[#b7b1ef]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => onConsentChange(event.target.checked)}
          className="mt-0.5 size-[22px] shrink-0 accent-[#4338ca] cursor-pointer"
        />
        <span className="text-[13px] leading-5 text-[#4b4768]">
          {privacyText ||
            "Li e aceito que minhas respostas sejam usadas na pesquisa do projeto e autorizo o uso dos meus dados para receber o cupom."}
        </span>
      </label>
      {errors.consent && (
        <p role="alert" className="text-[12.5px] font-bold text-red-600">
          {errors.consent}
        </p>
      )}
    </div>
  );
}
