import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { answersRouter } from "./routes/answers";
import { questionsRouter } from "./routes/questions";
import { HealthResponse } from "./types/survey";

const allowedOrigin = process.env.CORS_ORIGIN ?? "*";

export function createApp() {
  const app = express();

  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const response: HealthResponse = { status: "ok" };
    res.status(200).json(response);
  });

  app.use(questionsRouter);
  app.use(answersRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Маршрут не найден" });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Необработанная ошибка:", err);
    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  });

  return app;
}
