import { Question, FieldErrors } from "./types";
import { cleanPhone } from "./formatters";

export function isSoldOut(message: string): boolean {
  return /esgotaram|esgotado/i.test(message);
}

export function validateIdentityStep(name: string, phone: string): FieldErrors {
  const errors: FieldErrors = {};
  if (name.trim().length < 2) {
    errors.name = "Digite seu nome para continuar.";
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
