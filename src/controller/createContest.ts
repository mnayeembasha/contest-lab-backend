import { Request,Response } from "express";
import { Contest } from "../models/contestModel";
import { Question } from "../models/questionModel";


// Create a contest
exports.createContest =  async (req:Request, res:Response) => {
  const { title, duration, questions } = req.body;

  try {
    // Assuming questions are already present in DB
    const questionsData = await Question.find({ _id: { $in: questions } });

    const newContest = new Contest({
      title,
      startTime: new Date(),
      duration,
      questions: questionsData
    });

    await newContest.save();
    res.status(201).json({ contest: newContest });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
