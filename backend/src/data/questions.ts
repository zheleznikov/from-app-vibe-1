import { Question } from "../types/survey";

export const questions: Question[] = [
  {
    id: "name",
    text: "Как вас зовут?",
    type: "text",
    required: true,
  },
  {
    id: "experience",
    text: "Сколько лет вы занимаетесь разработкой?",
    type: "number",
    required: true,
  },
  {
    id: "role",
    text: "Кем вы сейчас работаете?",
    type: "text",
    required: false,
  },
  {
    id: "feedback",
    text: "Что вы ожидаете от курса?",
    type: "textarea",
    required: false,
  },
];
