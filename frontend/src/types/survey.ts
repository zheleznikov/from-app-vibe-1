export type QuestionType = "text" | "number" | "textarea";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

export type AnswerValue = string | number;

export type AnswersState = Record<string, AnswerValue>;

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

export interface ApiError {
  message: string;
}
