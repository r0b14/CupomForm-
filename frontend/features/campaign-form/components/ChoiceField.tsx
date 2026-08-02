import { Question } from "../types";

type ChoiceFieldProps = {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function ChoiceField({
  question,
  value,
  onChange,
  error,
}: ChoiceFieldProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[13.5px] font-extrabold leading-5 text-[#1b1830]">
        {question.label}
        {question.required && <span className="text-red-600"> *</span>}
      </legend>
      <div className="space-y-2.5">
        {question.options?.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[14px] border-[1.5px] px-4 py-3 text-left text-[15px] font-bold transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4338ca] ${
                selected
                  ? "border-[#4338ca] bg-[#eceafc] text-[#1b1830] shadow-sm"
                  : "border-[#e7e5f0] bg-white text-[#1b1830] hover:border-[#b7b1ef] hover:bg-[#faf9fe]"
              }`}
              aria-pressed={selected}
            >
              <span className="leading-snug">{option}</span>
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  selected
                    ? "border-[#4338ca] bg-[#4338ca]"
                    : "border-[#c9c5dc] bg-white"
                }`}
              >
                {selected && (
                  <span className="size-1.5 rounded-full bg-white transition-transform transform scale-100" />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-[12.5px] font-bold text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
