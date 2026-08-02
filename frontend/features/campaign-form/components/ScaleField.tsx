import { Question } from "../types";

type ScaleFieldProps = {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function stripOrdinal(label: string): string {
  return label.replace(/^\d+\s*-\s*/, "");
}

export function ScaleField({
  question,
  value,
  onChange,
  error,
}: ScaleFieldProps) {
  const options = question.options ?? [];
  const total = options.length || 5;
  const selectedIndex = value ? options.indexOf(value) : -1;
  const answered = selectedIndex >= 0;
  const position = answered ? selectedIndex + 1 : Math.ceil(total / 2);

  function handleChange(rawPosition: number) {
    const option = options[rawPosition - 1];
    if (option !== undefined) onChange(option);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13.5px] font-extrabold leading-5 text-[#1b1830]">
        {question.label}
        {question.required && <span className="text-red-600"> *</span>}
      </span>
      <div className="rounded-[14px] border-[1.5px] border-[#e7e5f0] bg-white px-4 py-4">
        <input
          type="range"
          min={1}
          max={total}
          step={1}
          value={position}
          onChange={(event) => handleChange(Number(event.target.value))}
          aria-label={question.label}
          className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e7e5f0] accent-[#4338ca] transition-opacity ${
            answered ? "opacity-100" : "opacity-50"
          }`}
        />
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold leading-snug text-[#6b6785]">
          <span className="max-w-[38%]">{stripOrdinal(options[0] ?? "")}</span>
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-extrabold transition-colors ${
              answered
                ? "bg-[#eceafc] text-[#4338ca]"
                : "bg-[#f1f0f8] text-[#a29fc0]"
            }`}
          >
            {answered ? position : "?"}
          </span>
          <span className="max-w-[38%] text-right">
            {stripOrdinal(options[total - 1] ?? "")}
          </span>
        </div>
      </div>
      {error && (
        <span role="alert" className="text-[12.5px] font-bold text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
