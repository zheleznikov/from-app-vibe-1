import { FormEvent, useEffect, useState } from "react";
import { ApiRequestError, fetchQuestions, submitAnswers } from "../api/surveyApi";
import { AnswersState, Question } from "../types/survey";

type LoadState = "loading" | "success" | "error";
type SubmitState = "idle" | "submitting" | "submitted" | "error";

export default function SurveyForm() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    fetchQuestions()
      .then((data) => {
        if (cancelled) return;
        setQuestions(data);
        setLoadState("success");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof ApiRequestError
            ? error.message
            : "Не удалось загрузить вопросы анкеты";
        setLoadError(message);
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setFieldErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    for (const question of questions) {
      const value = answers[question.id];
      const isEmpty =
        value === undefined || String(value).trim().length === 0;

      if (question.required && isEmpty) {
        errors[question.id] = "Это поле обязательно для заполнения";
        continue;
      }

      if (!isEmpty && question.type === "number" && Number.isNaN(Number(value))) {
        errors[question.id] = "Введите число";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitState === "submitting") {
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitState("submitting");
    setSubmitError("");

    const preparedAnswers: AnswersState = {};
    for (const question of questions) {
      const value = answers[question.id];
      if (value === undefined || String(value).trim().length === 0) {
        continue;
      }
      preparedAnswers[question.id] =
        question.type === "number" ? Number(value) : value;
    }

    try {
      const result = await submitAnswers(preparedAnswers);
      if (result.success) {
        setSubmitState("submitted");
      } else {
        setSubmitError(result.message);
        setSubmitState("error");
      }
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : "Произошла непредвиденная ошибка при отправке";
      setSubmitError(message);
      setSubmitState("error");
    }
  }

  if (loadState === "loading") {
    return (
      <div className="card" role="status">
        <p>Загрузка анкеты…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="card">
        <p className="error-banner" role="alert">
          {loadError}
        </p>
      </div>
    );
  }

  if (submitState === "submitted") {
    return (
      <div className="card success-screen">
        <h1>Спасибо!</h1>
        <p>Ваши ответы успешно сохранены.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Мини-анкета</h1>
      <form onSubmit={handleSubmit} noValidate>
        {questions.map((question) => (
          <div className="field" key={question.id}>
            <label htmlFor={question.id}>
              {question.text}
              {question.required && <span className="required-mark"> *</span>}
            </label>

            {question.type === "textarea" ? (
              <textarea
                id={question.id}
                value={(answers[question.id] as string) ?? ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                disabled={submitState === "submitting"}
                rows={4}
              />
            ) : (
              <input
                id={question.id}
                type={question.type === "number" ? "number" : "text"}
                value={(answers[question.id] as string) ?? ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                disabled={submitState === "submitting"}
              />
            )}

            {fieldErrors[question.id] && (
              <p className="field-error">{fieldErrors[question.id]}</p>
            )}
          </div>
        ))}

        {submitState === "error" && submitError && (
          <p className="error-banner" role="alert">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting" ? "Отправка…" : "Отправить"}
        </button>
      </form>
    </div>
  );
}
