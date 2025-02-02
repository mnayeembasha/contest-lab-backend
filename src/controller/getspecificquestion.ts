import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Question, TestCase } from "../types";

// In-memory storage for questions
const questions: Record<string, Question> = {
  "2c5ee640-c477-4a3e-98c9-5fcaee6aaa43": {
    title: "Pascal's Triangle",
    description: "Write a program to return the nth row of Pascal’s Triangle.",
    testCases: [
      { input: "0", expected: "1" },
      { input: "1", expected: "1,1" },
      { input: "2", expected: "1,2,1" },
      { input: "5", expected: "1,5,10,10,5,1" },
      { input: "33", expected: null },
    ],
  },
};

// Function to add a question
export const addQuestion = (title: string,description: string,testCases: TestCase[],templateCode?: string ): string => {
  const id = uuidv4();
  questions[id] = {title,description,testCases,templateCode};
  return id;
};

// Controller to get a specific question
export const getspecificquestion = (req: Request, res: Response): Response => {
  const { id } = req.params;
  const question = questions[id];

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }

  return res.status(200).json({ question });
};

// Controller to fetch all questions
export const question = (req: Request, res: Response): Response => {
  const questionList = Object.keys(questions).map((id) => ({
    id,
    title: questions[id].title,
    description: questions[id].description,
  }));
  return res.status(200).json({ questions: questionList });
};
