import { Fragment } from "react";
import { Question, FieldErrors } from "../types";
import { ChoiceField } from "./ChoiceField";
import { TextField } from "./TextField";
import { ScaleField } from "./ScaleField";
import { ProjectOverview } from "./ProjectOverview";
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
      {questions.map((question) => (
        <Fragment key={question.key}>
          {question.key === "sentido_para_vida" && <ProjectOverview />}
          {question.type === "SINGLE_CHOICE" ? (
          <ChoiceField
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
            question={question}
            value={answers[question.key] ?? ""}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
          />
        ) : (
          <TextField
            question={question}
            value={answers[question.key] ?? ""}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
          />
          )}
        </Fragment>
      ))}
    </>
  );
}
