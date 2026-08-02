import { Question, FieldErrors } from "../types";
import { ChoiceField } from "./ChoiceField";
import { TextField } from "./TextField";

type QuestionsStepProps = {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (key: string, value: string) => void;
  errors: FieldErrors;
};

export function QuestionsStep({
  questions,
  answers,
  onAnswerChange,
  errors,
}: QuestionsStepProps) {
  return (
    <>
      {questions.map((question) =>
        question.type === "SINGLE_CHOICE" ? (
          <ChoiceField
            key={question.key}
            question={question}
            value={answers[question.key] ?? ""}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
          />
        ) : (
          <TextField
            key={question.key}
            question={question}
            value={answers[question.key] ?? ""}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
          />
        )
      )}
    </>
  );
}
