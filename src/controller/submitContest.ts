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

exports.submitContest = async (req: Request<{}, {}, SubmitContestRequestBody>, res: Response): Promise<Response> => {
  const { userId, contestId, questionId, code } = req.body;

  try {
    // Find the user contest
    const userContest = await UserContest.findOne({ userId, contestId });
    if (!userContest) {
      return res.status(404).json({ message: 'Contest not found for user.' });
    }

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    // Ensure that the questionId is not null or undefined before proceeding
    const questionIndex = userContest.submissions.findIndex(sub => sub.questionId && sub.questionId.toString() === questionId.toString());
    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not part of this contest.' });
    }

    // Get the submission details
    const submission = userContest.submissions[questionIndex];

    // Ensure that the contest exists and has necessary fields
    const contest = await Contest.findById(contestId);
    if (!contest || !contest.startTime || contest.duration === undefined || contest.duration === null) {
      return res.status(404).json({ message: 'Contest not found or incomplete data.' });
    }

    // Check if the contest time is over
    const timeLeft = (new Date()).getTime() - contest.startTime.getTime();
    if (timeLeft > contest.duration * 60 * 1000) {
      return res.status(400).json({ message: 'Time for the contest has ended.' });
    }

    // Save the submission code and time taken
    submission.code = code;
    submission.submissionTime = new Date();
    submission.isSubmitted = true;

    // Calculate the time taken for the submission
    const startTime = new Date(submission.submissionTime);
    const endTime = new Date();
    submission.timeTaken = (endTime.getTime() - startTime.getTime()) / 1000; // Time in seconds

    // Save the user contest document
    await userContest.save();

    // Respond with success
    return res.status(200).json({ message: 'Code submitted successfully.' });
  } catch (error: unknown) {
    // Safely handle errors, ensuring that we get the message from an Error instance
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "An unexpected error occurred." });
  }
};
