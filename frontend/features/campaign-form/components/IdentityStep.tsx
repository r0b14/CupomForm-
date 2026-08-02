import { FieldErrors } from "../types";
import { formatPhone } from "../formatters";

type IdentityStepProps = {
  name: string;
  phone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  errors: FieldErrors;
};

export function IdentityStep({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  errors,
}: IdentityStepProps) {
  return (
    <>
      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-extrabold text-[#1b1830]">
          Nome<span className="text-red-600"> *</span>
        </span>
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          autoComplete="name"
          placeholder="Como podemos te chamar?"
          className={`h-[52px] rounded-[14px] border-[1.5px] px-4 text-base text-[#1b1830] placeholder:text-[#a29fc0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4338ca]/25 ${
            errors.name ? "border-red-600" : "border-[#e7e5f0] hover:border-[#b7b1ef]"
          }`}
        />
        {errors.name && (
          <span role="alert" className="text-[12.5px] font-bold text-red-600">
            {errors.name}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-extrabold text-[#1b1830]">
          WhatsApp<span className="text-red-600"> *</span>
        </span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => onPhoneChange(formatPhone(event.target.value))}
          inputMode="tel"
          autoComplete="tel"
          maxLength={15}
          placeholder="(11) 91234-5678"
          className={`h-[52px] rounded-[14px] border-[1.5px] px-4 text-base text-[#1b1830] placeholder:text-[#a29fc0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4338ca]/25 ${
            errors.phone ? "border-red-600" : "border-[#e7e5f0] hover:border-[#b7b1ef]"
          }`}
        />
        {errors.phone && (
          <span role="alert" className="text-[12.5px] font-bold text-red-600">
            {errors.phone}
          </span>
        )}
      </label>
    </>
  );
}
