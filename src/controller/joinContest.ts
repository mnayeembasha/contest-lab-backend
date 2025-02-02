import { Request, Response } from "express";
import { Contest } from "../models/contestModel";
import { UserContest } from "../models/usercontestModel";


// Controller function to join a contest
export const joinContest = async (req: Request, res: Response): Promise<Response> => {
  const { userId, contestId } = req.body;

  try {
    // Find contest by ID
    const contest= await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found." });

    // Create new UserContest entry
    const userContest = new UserContest({
      userId,
      contestId,
      submissions: contest.questions.map((question) => ({
        questionId: question._id.toString(),
        code: "",
        submissionTime: null,
        isSubmitted: false,
        timeTaken: 0,
      })),
    });

    // Save the UserContest document
    await userContest.save();

    return res.status(200).json({ message: "Joined contest successfully." });
  } catch (error) {
    return res.status(400).json({ error: error});
  }
};
