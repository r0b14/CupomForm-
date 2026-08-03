import { Question } from "../types";

type MultipleChoiceFieldProps = {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

export function MultipleChoiceField({
  question,
  value,
  onChange,
  error,
}: MultipleChoiceFieldProps) {
  const options = question.options ?? [];
  const limit = question.maxSelections ?? options.length;
  const limitReached = value.length >= limit;

  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((selected) => selected !== option));
      return;
    }
    if (!limitReached) onChange([...value, option]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-[13.5px] font-extrabold leading-5 text-[#1b1830]">
        {question.label}
        {question.required && <span className="text-red-600"> *</span>}
      </legend>
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#77738f]">
        <p>Escolha até {limit} opções.</p>
        <p aria-live="polite">{value.length} de {limit}</p>
      </div>
      <div className="space-y-2.5">
        {options.map((option) => {
          const selected = value.includes(option);
          const unavailable = limitReached && !selected;
          return (
            <label
              key={option}
              className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[14px] border-[1.5px] px-4 py-3 text-left text-[15px] font-bold transition-all duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#4338ca] ${
                selected
                  ? "border-[#4338ca] bg-[#eceafc] text-[#1b1830] shadow-sm"
                  : unavailable
                    ? "cursor-not-allowed border-[#eeedf4] bg-[#fafafa] text-[#aaa7b8] opacity-45"
                    : "cursor-pointer border-[#e7e5f0] bg-white text-[#1b1830] hover:border-[#b7b1ef] hover:bg-[#faf9fe]"
              }`}
            >
              <span className="leading-snug">{option}</span>
              <input
                type="checkbox"
                checked={selected}
                disabled={unavailable}
                onChange={() => toggle(option)}
                className="size-5 shrink-0 accent-[#4338ca]"
              />
            </label>
          );
        })}
      </div>
      {error && <p role="alert" className="text-[12.5px] font-bold text-red-600">{error}</p>}
    </fieldset>
  );
}
