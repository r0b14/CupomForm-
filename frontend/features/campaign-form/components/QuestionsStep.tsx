import { Question, FieldErrors } from "../types";
import { ChoiceField } from "./ChoiceField";
import { TextField } from "./TextField";
import { ScaleField } from "./ScaleField";
import {
  NEIGHBORHOOD_QUESTION_KEY,
  NEIGHBORHOOD_VISIBLE_COUNT,
} from "../constants";

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
            visibleCount={
              question.key === NEIGHBORHOOD_QUESTION_KEY
                ? NEIGHBORHOOD_VISIBLE_COUNT
                : undefined
            }
          />
        ) : question.type === "SCALE" ? (
          <ScaleField
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
