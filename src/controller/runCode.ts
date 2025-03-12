import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
// import { Question } from "../types";
// import { JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET } from "../config";
import { Question as QuestionModel } from "../models/questionModel";
import { ApiKey } from "../models/apiKeyModel";
import { teckziteUserModel } from "../models/teckziteUserModel";
import { AuthenticatedRequest } from "./teckziteLoginHandler";

const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";

interface JdoodleRequest {
  clientId: string;
  clientSecret: string;
  script: string;
  stdin: string;
  language: string;
  versionIndex: string;
}

interface JdoodleResponse {
  output?: string;
  statusCode?: number;
  memory?: string;
  cpuTime?: string;
  error?: string;
}

export const getApiKey = async () => {
  try {
    const apiKey = await ApiKey.findOne().sort({ usageCount: 1 }); // Get least used key

    if (!apiKey) {
      throw new Error("No API Keys available.");
    }

    if (apiKey.usageCount >= apiKey.limit) {
      console.log(`API Key ${apiKey.clientId} reached limit. Switching to next.`);
      return await getApiKey(); // Get the next available key
    }

    return apiKey;
  } catch (error) {
    console.error("Error fetching API key:", error);
    throw new Error("Database error while fetching API key.");
  }
};

export const incrementApiKeyUsage = async (clientId: string) => {
  try {
    const result = await ApiKey.updateOne({ clientId }, { $inc: { usageCount: 1 } });

    if (result.modifiedCount === 0) {
      throw new Error(`Failed to update usage count for API key: ${clientId}`);
    }
  } catch (error) {
    console.error("Error updating API key usage:", error);
    throw new Error("Database error while updating API key usage.");
  }
};


export const runCode = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Ensure the user is logged in
    if (!req.user || !req.user?.teckziteId) {
      return res.status(401).json({ error: "Not logged in." });
    }
    const teckziteId = req.user?.teckziteId;

    // Retrieve the user from the database
    const user = await teckziteUserModel.findOne({ teckziteId });
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    // Safely parse the usageCount
    let currentUsage = Number(user.usageCount);
    if (isNaN(currentUsage)) {
      currentUsage = 0;
      user.usageCount = 0;
    }

    // Check if the user has reached the maximum number of requests (limit = 8)
    if (currentUsage >= 8) {
      return res.status(201).json({ message: "Maximum request limit reached.", remainingAttempts: 0 });
    }

    // Increment user's usage count and save the document
    user.usageCount = currentUsage + 1;
    await user.save();
    const remainingAttempts = 8 - user.usageCount;

    // Validate required fields from the request
    const { code, language, slug } = req.body;
    const suppLangAndVIndex = {
      java: { languageCode: "java", versionIndex: 5 },
      c: { languageCode: "c", versionIndex: 6 },
      "c++": { languageCode: "cpp", versionIndex: 6 },
      python: { languageCode: "python3", versionIndex: 5 },
      javascript: { languageCode: "nodejs", versionIndex: 6 },
    };

    if (!code || !language || !slug || !suppLangAndVIndex[language]) {
      return res.status(400).json({ error: "Missing or invalid required fields." });
    }
    const { languageCode, versionIndex } = suppLangAndVIndex[language];

    // Retrieve the contest question
    const question = await QuestionModel.findOne({ slug });
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    // Prepare input and expected output files
    const inputsArray = question.testCases.map((tc) => tc.input.trim());
    const expectedOutputsArray = question.testCases.map((tc) => tc.expected.trim() || "null");

    fs.writeFileSync("input.txt", inputsArray.join("\n"), "utf8");
    fs.writeFileSync("expected_output.txt", expectedOutputsArray.join("\n"), "utf8");

    // Get the API key from the database (based on usage)
    const apiKey = await getApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: "No API keys available." });
    }

    try {
      // Call the JDOODLE API using the selected API key
      const response = await axios.post<JdoodleResponse>(JDOODLE_URL, {
        clientId: apiKey.clientId,
        clientSecret: apiKey.clientSecret,
        script: code,
        stdin: inputsArray.join("\n"),
        language: languageCode,
        versionIndex,
      });

      // Increment API key usage count
      await incrementApiKeyUsage(apiKey.clientId);

      // Process the API response
      const output = response.data.output?.trim() || "";
      const outputArray = output.split("\n");
      const results: { input: string; output: string; expected: string | null; success: boolean }[] = [];

   // Update the loop to collect all results and check for any failures
for (let i = 0; i < question.testCases.length; i++) {
  const input = question.testCases[i].input;
  const expected = question.testCases[i].expected;
  const caseOutput = outputArray[i]?.trim() || "";

  fs.appendFileSync("output.txt", `${caseOutput}\n`, "utf8");

  // Normalize output and expected for comparison
  const normalize = (str: string | null) => (str ? str.replace(/\s+/g, "") : "");
  const caseOutputNormalized = normalize(caseOutput);
  const expectedNormalized = normalize(expected);

  results.push({
    input,
    output: caseOutputNormalized,
    expected: expectedNormalized,
    success: caseOutputNormalized === expectedNormalized,
  });
}

// Check if all test cases passed
const allPassed = results.every(result => result.success);

if (allPassed) {
  return res.status(200).json({
    message: "Code executed successfully for all test cases.",
    results,
    remainingAttempts,
  });
} else {
  return res.status(200).json({
    error: "Logical Error: Some test cases failed.",
    results,
    remainingAttempts,
  });
}
    } catch (error) {
      console.error("Error during API request:", error);
      return res.status(500).json({
        error: "Error during code execution.",
        details: error.message,
        remainingAttempts,
      });
    }
  } catch (error) {
    console.error("Unexpected error in runCode:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};



