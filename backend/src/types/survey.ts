export type QuestionType = "text" | "number" | "textarea";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

export type AnswerValue = string | number;

export type AnswersMap = Record<string, AnswerValue>;

export interface Submission {
  id: string;
  submittedAt: string;
  answers: AnswersMap;
}

export interface AnswersRequestBody {
  answers: AnswersMap;
}

export interface SuccessResponse {
  success: true;
  message: string;
  submissionId: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
}

export type AnswersResponse = SuccessResponse | ErrorResponse;

export interface HealthResponse {
  status: "ok";
}
