import axios from "axios";
import { Request, Response } from "express";
import { JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET } from "../config";
const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";

// Define types for the test case and question
interface TestCase {
  input: string;
  expected: string;
}

interface Question {
  testCases: TestCase[];
}

interface Result {
  input: string;
  expected: string;
  output: string;
  success: boolean;
  error?: string; // optional error property
}

// Assuming `questions` is a dictionary of Question objects indexed by ID
const questions: { [id: string]: Question } = {}; // Define this properly with your data

// Route to submit code for all test cases
export const submitCode = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { code, language, versionIndex }: { code: string, language: string, versionIndex: string } = req.body;

  const question = questions[id];

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }

  if (!code || !language || !versionIndex) {
    return res.status(400).json({ error: "Missing required fields: code, language, versionIndex" });
  }

  const results: Result[] = [];
  let allPassed = true;

  for (const testCase of question.testCases) {
    try {
      const response = await axios.post(JDOODLE_URL, {
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
        script: code,
        stdin: testCase.input,
        language,
        versionIndex,
      });

      const output = response.data.output.trim();
      const success = output === testCase.expected;

      if (!success) allPassed = false;

      results.push({
        input: testCase.input,
        expected: testCase.expected,
        output,
        success,
      });

      if (!allPassed) break; // Stop further execution if one test case fails
    } catch (error: unknown) {
      // Handle error type assertion
      if (error instanceof Error) {
        allPassed = false;
        results.push({
          input: testCase.input,
          expected: testCase.expected, // Set expected value even on error
          output: "", // Set output to an empty string on error
          error: error.message,
          success: false,
        });
      } else {
        allPassed = false;
        results.push({
          input: testCase.input,
          expected: testCase.expected, // Set expected value even on error
          output: "", // Set output to an empty string on error
          error: "Unknown error occurred",
          success: false,
        });
      }
      break;
    }
  }

  if (!allPassed) {
    return res.status(400).json({ error: "Code failed some test cases", results });
  }

  return res.status(200).json({ message: "Code passed all test cases!", results });
};
