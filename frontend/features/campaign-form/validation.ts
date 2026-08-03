import { Answers, Question, FieldErrors } from "./types";
import { cleanPhone } from "./formatters";

export function validateIdentityStep(name: string, phone: string): FieldErrors {
  const errors: FieldErrors = {};
  if (name.trim().length < 8) {
    errors.name = "Digite seu nome completo (mínimo 8 caracteres).";
  }
  if (cleanPhone(phone).length < 10) {
    errors.phone = "Informe um WhatsApp válido com DDD.";
  }
  return errors;
}

export function validateConsentStep(consent: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (!consent) {
    errors.consent = "Aceite a política para continuar.";
  }
  return errors;
}

export function validateQuestionsStep(
  questions: Question[],
  answers: Answers
): FieldErrors {
  const errors: FieldErrors = {};
  for (const question of questions) {
    const answer = answers[question.key];
    const empty = Array.isArray(answer) ? answer.length === 0 : !answer?.trim();
    if (question.required && empty) {
      errors[question.key] = "Escolha uma opção para continuar.";
    }
    if (
      question.type === "MULTIPLE_CHOICE" &&
      Array.isArray(answer) &&
      question.maxSelections !== null &&
      answer.length > question.maxSelections
    ) {
      errors[question.key] = `Escolha no máximo ${question.maxSelections} opções.`;
    }
  }
  return errors;
}
