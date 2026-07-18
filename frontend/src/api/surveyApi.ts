import {
  AnswersResponse,
  AnswersState,
  ApiError,
  Question,
  QuestionType,
} from "../types/survey";

const API_URL = import.meta.env.VITE_API_URL;

const QUESTION_TYPES: QuestionType[] = ["text", "number", "textarea"];

function isQuestion(value: unknown): value is Question {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.required === "boolean" &&
    typeof candidate.type === "string" &&
    QUESTION_TYPES.includes(candidate.type as QuestionType)
  );
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiRequestError("Сервер вернул некорректные данные");
  }
}

export class ApiRequestError extends Error implements ApiError {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function fetchQuestions(): Promise<Question[]> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/questions`);
  } catch {
    throw new ApiRequestError(
      "Не удалось подключиться к серверу. Проверьте, что backend запущен."
    );
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new ApiRequestError("Не удалось загрузить вопросы анкеты");
  }

  if (!Array.isArray(data) || !data.every(isQuestion)) {
    throw new ApiRequestError("Сервер вернул некорректные данные о вопросах");
  }

  return data;
}

export async function submitAnswers(
  answers: AnswersState
): Promise<AnswersResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
  } catch {
    throw new ApiRequestError(
      "Не удалось подключиться к серверу. Проверьте, что backend запущен."
    );
  }

  const data = await parseJsonSafely(response);

  if (typeof data !== "object" || data === null || !("success" in data)) {
    throw new ApiRequestError("Сервер вернул некорректные данные");
  }

  const result = data as AnswersResponse;

  if (!response.ok && response.status !== 400) {
    throw new ApiRequestError(
      result.message || "Произошла внутренняя ошибка сервера"
    );
  }

  return result;
}
