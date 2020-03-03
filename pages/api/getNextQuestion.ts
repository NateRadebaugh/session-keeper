import Cors from "micro-cors";

import connectToDatabase from "../../utils/connectToDatabase";
import { Question, RichQuestion } from "../../types";
import getCallSession from "../../utils/getCallSession";
import setCallSession from "../../utils/setCallSession";

const cors = Cors({
  allowMethods: ["GET", "HEAD"]
});

const QuestionType_Name = "Name";
const QuestionType_Number = "Number";

const defaultQuestions: RichQuestion[] = [
  {
    ClientId: 123,
    QuestionId: 2,
    QuestionType: QuestionType_Name,
    Prompts: {
      "en-US": "Question 2: Hi, What is your name?",
      "es-US": "Question 2: Hola, What is your name?"
    },
    SortOrder: 2
  },
  {
    ClientId: 123,
    QuestionId: 1,
    QuestionType: QuestionType_Number,
    Prompts: {
      "en-US": "Question 1: Hi, How old are you?",
      "es-US": "Question 1: Hola, How old are you?"
    },
    SortOrder: 1
  },
  {
    ClientId: 123,
    QuestionId: 3,
    QuestionType: QuestionType_Number,
    Prompts: {
      "en-US": "Question 3: Hi, How many pets do you have?",
      "es-US": "Question 3: Hola, How many pets do you have?"
    },
    SortOrder: 3
  }
];

async function getClientQuestions(
  clientId: number,
  locale: string
): Promise<Question[]> {
  // Get a database connection, cached or otherwise,
  // using the connection string environment variable as the argument
  const db = await connectToDatabase();

  // Select the "questions" collection from the database
  const questions = await db.collection<RichQuestion>("questions");

  // Select the users collection from the database
  const clientQuestions = await questions
    .find({ ClientId: clientId })
    .toArray();

  //
  // Create initial data if it doesn't yet exist
  //
  if (!clientQuestions || !clientQuestions.length) {
    questions.insertMany(defaultQuestions);
    defaultQuestions.forEach(q => {
      clientQuestions.push(q);
    });
  }

  clientQuestions.sort((a, b) => (a.SortOrder > b.SortOrder ? 1 : -1));

  return clientQuestions.map((q, questionIndex) => {
    return {
      ClientId: q.ClientId,
      QuestionId: q.QuestionId,
      QuestionType: q.QuestionType,
      Prompt: q.Prompts[locale],
      SortOrder: q.SortOrder,
      QuestionNumber: questionIndex + 1
    };
  });
}

module.exports = cors(async (req, res) => {
  const query = req.query;
  const {
    ClientId,
    PhoneNumber,
    Locale,
    ThisQuestionId,
    ThisAnswer: thisAnswer
  } = query;
  if (!ClientId || !PhoneNumber || !Locale) {
    res.status(400).json({
      error: "Bad request. ClientId, PhoneNumber, and Locale are required"
    });
    return;
  }

  // for testing POC
  let clientId = 123;

  const clientQuestions = await getClientQuestions(clientId, Locale);
  const existingSession = await getCallSession(clientId, PhoneNumber);

  //
  // Submit new answer to DB
  //
  const thisQuestionId = Number.parseInt(ThisQuestionId);
  if (
    clientQuestions.find(q => q.QuestionId === thisQuestionId) &&
    thisQuestionId &&
    thisAnswer
  ) {
    const existingAnswer = existingSession.Answers.find(
      a => a.QuestionId === thisQuestionId
    );
    if (!existingAnswer) {
      // Add answer for this question
      existingSession.Answers.push({
        QuestionId: thisQuestionId,
        Answer: thisAnswer
      });

      await setCallSession(existingSession);
    }
  }

  // Return early if there's no questions
  if (clientQuestions.length === 0) {
    res.status(200).json({
      Question: undefined,
      HasNextQuestion: false,
      NumTotalQuestions: 0,
      Answers: [],
      ExistingSession: existingSession
    });
  }

  //
  // Get (next) question
  //
  const lastAnswerQuestionId =
    thisQuestionId || existingSession.Answers.length > 0
      ? existingSession.Answers[existingSession.Answers.length - 1].QuestionId
      : -1;
  const thisQuestionIndex = clientQuestions.findIndex(
    q => q.QuestionId === lastAnswerQuestionId
  );

  // Only increment when it's first, or there's an answer we're submitting
  const newQuestionIndex =
    !thisQuestionId || thisAnswer ? thisQuestionIndex + 1 : thisQuestionIndex;
  const hasNextQuestion = newQuestionIndex < clientQuestions.length - 1;

  const newQuestion = clientQuestions[newQuestionIndex];

  // Respond with a JSON string
  res.status(200).json({
    Question: newQuestion,
    HasNextQuestion: hasNextQuestion,
    NumTotalQuestions: clientQuestions.length,
    Answers: existingSession.Answers,
    ExistingSession: existingSession
  });
});
