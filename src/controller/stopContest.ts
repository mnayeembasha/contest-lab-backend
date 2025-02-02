import { UserContest } from "../models/usercontestModel";

export const stopContest =  async (req, res) => {
    const { userId, contestId } = req.body;

    try {
      const userContest = await UserContest.findOne({ userId, contestId });
      if (!userContest) return res.status(404).json({ message: 'User contest not found.' });

      userContest.isCompleted = true;
      await userContest.save();

      res.status(200).json({ message: 'Contest stopped successfully.' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
