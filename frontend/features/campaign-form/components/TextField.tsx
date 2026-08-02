import { Question } from "../types";

type TextFieldProps = {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function TextField({
  question,
  value,
  onChange,
  error,
}: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13.5px] font-extrabold text-[#1b1830]">
        {question.label}
        {question.required && <span className="text-red-600"> *</span>}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={question.required}
        maxLength={500}
        rows={4}
        placeholder="Escreva aqui"
        className={`w-full resize-y rounded-[14px] border-[1.5px] px-4 py-3 text-[15px] leading-6 text-[#1b1830] placeholder:text-[#a29fc0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4338ca]/25 ${
          error ? "border-red-600" : "border-[#e7e5f0] hover:border-[#b7b1ef]"
        }`}
      />
      {error && (
        <span role="alert" className="text-[12.5px] font-bold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
