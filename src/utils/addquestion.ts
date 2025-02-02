import { v4 as uuidv4 } from "uuid";

interface TestCase {
  input: string;
  expected: string | null;
}

interface Question {
  title: string;
  description: string;
  testCases: TestCase[];
  templateCode: string;
}

// Define stored questions
const questions: Record<string, Question> = {};

export default function addQuestion(
  title: string,
  description: string,
  testCases: TestCase[],
  templateCode: string
): string {
  const id = uuidv4();
  questions[id] = {
    title,
    description,
    testCases,
    templateCode,
  };
  return id;
}
