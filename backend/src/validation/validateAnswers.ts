import { Question } from "../types/survey";

export interface ValidationSuccess {
  valid: true;
  answers: Record<string, string | number>;
}

export interface ValidationFailure {
  valid: false;
  message: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateAnswers(
  body: unknown,
  questions: Question[]
): ValidationResult {
  if (!isPlainObject(body) || !("answers" in body)) {
    return { valid: false, message: "Отсутствует поле answers" };
  }

  const rawAnswers = body.answers;

  if (!isPlainObject(rawAnswers)) {
    return { valid: false, message: "Поле answers должно быть объектом" };
  }

  const cleanedAnswers: Record<string, string | number> = {};

  for (const question of questions) {
    const value = rawAnswers[question.id];
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim().length === 0);

    if (question.required && isEmpty) {
      return {
        valid: false,
        message: `Не заполнен обязательный вопрос: ${question.text}`,
      };
    }

    if (isEmpty) {
      continue;
    }

    if (question.type === "number") {
      const numberValue = typeof value === "number" ? value : Number(value);
      if (typeof value !== "number" && typeof value !== "string") {
        return {
          valid: false,
          message: `Некорректный формат ответа на вопрос: ${question.text}`,
        };
      }
      if (Number.isNaN(numberValue)) {
        return {
          valid: false,
          message: `Ответ на вопрос "${question.text}" должен быть числом`,
        };
      }
      cleanedAnswers[question.id] = numberValue;
    } else {
      if (typeof value !== "string" && typeof value !== "number") {
        return {
          valid: false,
          message: `Некорректный формат ответа на вопрос: ${question.text}`,
        };
      }
      cleanedAnswers[question.id] = String(value);
    }
  }

  return { valid: true, answers: cleanedAnswers };
}
