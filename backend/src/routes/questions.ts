import { Router } from "express";
import { questions } from "../data/questions";

export const questionsRouter = Router();

questionsRouter.get("/questions", (_req, res) => {
  res.status(200).json(questions);
});
