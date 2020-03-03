import { ObjectID } from "mongodb";

export interface RichQuestion {
  _id?: ObjectID;
  ClientId: number;
  QuestionId: number;
  QuestionType: string;
  Prompts: { [x: string]: string };
  SortOrder: number;
}

export interface Question {
  ClientId: number;
  QuestionId: number;
  QuestionType: string;
  Prompt: string;
  SortOrder: number;
  QuestionNumber: number;
}

export interface QuestionDetails {
  Question: Question | undefined;
  HasNextQuestion: boolean | undefined;
  NumTotalQuestions: number | undefined;
  Answers: AnswerDetails[];
}

export interface AnswerDetails {
  QuestionId: number;
  Answer: string;
}

export interface SessionCacheDetails {
  _id?: ObjectID;
  ClientId: number;
  PhoneNumber: string;
  UserId?: number;
  Answers: AnswerDetails[];
}
