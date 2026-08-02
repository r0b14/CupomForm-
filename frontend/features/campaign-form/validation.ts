import { Question, FieldErrors } from "./types";
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
  answers: Record<string, string>
): FieldErrors {
  const errors: FieldErrors = {};
  for (const question of questions) {
    if (question.required && !answers[question.key]?.trim()) {
      errors[question.key] = "Escolha uma opção para continuar.";
    }
  }
  return errors;
}
