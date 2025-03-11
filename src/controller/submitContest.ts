import { Request, Response } from "express";
import { Contest } from "../models/contestModel";
import { Question } from "../models/questionModel";
import { UserContest } from "../models/usercontestModel";

// Define the types for the request body
interface SubmitContestRequestBody {
  userId: string;
  contestId: string;
  questionId: string;
  code: string;
}

interface Answers {
  [questionTitle: string]: {
    [language: string]: string;
  };
}

export const submitContest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId: teckziteId, contestId, answers, timeTaken } = req.body;

    console.log("Submitting contest for:", teckziteId, contestId, answers);

    if (!teckziteId || !contestId || !answers) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch contest details
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    // Check if contest time has ended (if needed)
    const currentTime = new Date();
    const contestEndTime = new Date(contest.startTime.getTime() + contest.duration * 60000);
    // Uncomment below if you want to enforce contest end time
    // if (currentTime > contestEndTime) {
    //   return res.status(403).json({ error: "Contest has already ended" });
    // }

    const typedAnswers: Answers = answers as Answers;

    // Convert answers into an array of submissions
    const submissions = await Promise.all(
      Object.entries(typedAnswers).map(async ([questionTitle, languages]) => {
        const question = await Question.findOne({ slug: questionTitle });
        if (!question || !question._id) {
          throw new Error(`Question not found or has no _id for slug: ${questionTitle}`);
        }

        return Object.entries(languages).map(([language, code]) => ({
          questionId: question._id,
          language,
          code,
          submissionTime: new Date(),
          isSubmitted: true,
        }));
      })
    );
    const flattenedSubmissions = submissions.flat();

    console.log("Flattened submissions:", flattenedSubmissions);

    // Check if user already has a submission for this contest
    let userContest = await UserContest.findOne({ teckziteId, contestId });
    if (userContest) {
      return res.status(401).json({ message: "User already submitted the contest" });
    } else {
      // Create new record
      userContest = new UserContest({
        teckziteId,
        contestId,
        submissions: flattenedSubmissions,
        isCompleted: true,
        timeTaken: timeTaken,
      });
    }

    // Save the new submission record to the database
    await userContest.save();

    return res.status(201).json({ message: "Contest submitted successfully" });
  } catch (error) {
    console.error("Error submitting contest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
