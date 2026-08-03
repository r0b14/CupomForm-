import { Fragment } from "react";
import { Answers, AnswerValue, Question, FieldErrors } from "../types";
import { ChoiceField } from "./ChoiceField";
import { TextField } from "./TextField";
import { ScaleField } from "./ScaleField";
import { ProjectOverview } from "./ProjectOverview";
import { MultipleChoiceField } from "./MultipleChoiceField";
import {
  NEIGHBORHOOD_QUESTION_KEY,
  NEIGHBORHOOD_VISIBLE_COUNT,
} from "../constants";

type QuestionsStepProps = {
  questions: Question[];
  answers: Answers;
  onAnswerChange: (key: string, value: AnswerValue) => void;
  errors: FieldErrors;
};

export function QuestionsStep({
  questions,
  answers,
  onAnswerChange,
  errors,
}: QuestionsStepProps) {
  const stringValue = (key: string) => {
    const value = answers[key];
    return typeof value === "string" ? value : "";
  };
  const multipleValue = (key: string) => {
    const value = answers[key];
    return Array.isArray(value) ? value : [];
  };

  return (
    <>
      {questions.some((question) => question.section === 5) && <ProjectOverview />}
      {questions.map((question) => (
        <Fragment key={question.key}>
          {question.type === "SINGLE_CHOICE" ? (
          <ChoiceField
            question={question}
            value={stringValue(question.key)}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
            visibleCount={
              question.key === NEIGHBORHOOD_QUESTION_KEY
                ? NEIGHBORHOOD_VISIBLE_COUNT
                : undefined
            }
          />
        ) : question.type === "MULTIPLE_CHOICE" ? (
          <MultipleChoiceField
            question={question}
            value={multipleValue(question.key)}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
          />
        ) : question.type === "SCALE" ? (
          <ScaleField
            question={question}
            value={stringValue(question.key)}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
          />
        ) : (
          <TextField
            question={question}
            value={stringValue(question.key)}
            onChange={(value) => onAnswerChange(question.key, value)}
            error={errors[question.key]}
          />
          )}
        </Fragment>
      ))}
    </>
  );
}
