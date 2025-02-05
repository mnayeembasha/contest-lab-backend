import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import { Question } from "../types";
import { JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET } from "../config";

const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";

// Define stored questions
const questions: Record<string, Question> = {
  "2c5ee640-c477-4a3e-98c9-5fcaee6aaa43": {
    title: "Pascal's Triangle",
    description: "Write a program to return the nth row of Pascal’s Triangle.",
    testCases: [
      { input: "0", expected: "[1]" },
      { input: "1", expected: "[1,1]" },
      { input: "2", expected: "[1,2,1]" },
      { input: "5", expected: "[1,5,10,10,5,1]" },
    ],
  },
};

// Define API request payload
interface JdoodleRequest {
  clientId: string;
  clientSecret: string;
  script: string;
  stdin: string;
  language: string;
  versionIndex: string;
}

// Define API response structure
interface JdoodleResponse {
  output?: string;
  statusCode?: number;
  memory?: string;
  cpuTime?: string;
  error?: string;
}

// Run submitted code
export const runCode = async (req: Request, res: Response): Promise<Response> => {
  const { code, language, versionIndex, questionId } = req.body;

  // console.log(code, language, versionIndex, questionId);

  // if (!code || !language || !versionIndex || !questionId) {
  //   return res.status(400).json({ error: "Missing required fields." });
  // }

  const question: Question | undefined = questions[questionId];
  if (!question) {
    return res.status(404).json({ error: "Question not found." });
  }

  const inputFilePath = "input.txt";
  const outputFilePath = "output.txt";
  const expectedFilePath = "expected_output.txt";

  // Prepare input and expected output files
  const inputsArray = question.testCases.map((tc) => tc.input);
  const expectedOutputsArray = question.testCases.map((tc) => tc.expected || "null");

  fs.writeFileSync(inputFilePath, inputsArray.join("\n"), "utf8");
  fs.writeFileSync(expectedFilePath, expectedOutputsArray.join("\n"), "utf8");

  try {
    // Call JDOODLE API
    const response = await axios.post<JdoodleResponse>(JDOODLE_URL, {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      // stdin: inputsArray.join("\n"),
      stdin: "2",
      language,
      versionIndex,
    });

    console.log("response=", response.data);

    const output = response.data.output?.trim() || "";
    const outputArray = output.split("\n");

    const results: { input: string; output: string; expected: string | null; success: boolean }[] = [];

    for (let i = 0; i < question.testCases.length; i++) {
      const input = question.testCases[i].input;
      const expected = question.testCases[i].expected;
      const caseOutput = outputArray[i]?.trim() || "";

      // Save output to file
      fs.appendFileSync(outputFilePath, `${caseOutput}\n`, "utf8");

      const normalize = (str: string | null) => (str ? str.replace(/\s+/g, "") : "");

      // Compare output with expected value
      if (normalize(caseOutput) === normalize(expected)) {
        results.push({ input, output: caseOutput, expected, success: true });
      } else {
        return res.status(200).json({
          error: "Logical Error",
          testCase: { input, expected, output: caseOutput },
        });
      }
    }

    return res.status(200).json({
      message: "Code executed successfully for all test cases.",
      results,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error during code execution.",
      details: error.message,
    });
  }
};
