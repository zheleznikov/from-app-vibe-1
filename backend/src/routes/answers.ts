import { randomUUID } from "crypto";
import { Router } from "express";
import { questions } from "../data/questions";
import { submissions } from "../data/submissions";
import { AnswersResponse } from "../types/survey";
import { validateAnswers } from "../validation/validateAnswers";

export const answersRouter = Router();

answersRouter.post("/answers", (req, res) => {
  const result = validateAnswers(req.body, questions);

  if (!result.valid) {
    const response: AnswersResponse = {
      success: false,
      message: result.message,
    };
    res.status(400).json(response);
    return;
  }

  const submissionId = randomUUID();

  submissions.push({
    id: submissionId,
    submittedAt: new Date().toISOString(),
    answers: result.answers,
  });

  const response: AnswersResponse = {
    success: true,
    message: "Ответы сохранены",
    submissionId,
  };
  res.status(201).json(response);
});

answersRouter.get("/answers", (_req, res) => {
  res.status(200).json(submissions);
});
