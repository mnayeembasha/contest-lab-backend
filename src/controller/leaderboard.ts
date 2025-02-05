import express from 'express';
import { User } from '../models/userModel';
import mongoose from 'mongoose';
import { UserContest } from '../models/usercontestModel.js';

const router = express.Router();

// Utility function to calculate similarity between two codes (basic plagiarism check)
const similarityCheck = (code1, code2) => {
    if (!code1 || !code2) return 0;
    let matches = 0;
    const minLen = Math.min(code1.length, code2.length);
    for (let i = 0; i < minLen; i++) {
        if (code1[i] === code2[i]) matches++;
    }
    return matches / Math.max(code1.length, code2.length);
};

// Calculate score based on time, completion, and plagiarism check
const calculateScore = (submissions, allSubmissions) => {
    let score = 0;
    let totalQuestions = submissions.length;
    
    submissions.forEach(submission => {
        if (submission.isSubmitted) {
            const timeFactor = Math.max(1000 - submission.timeTaken, 100); // Faster submission, higher score
            let plagiarismPenalty = 0;
            
            // Check for plagiarism against all submissions
            allSubmissions.forEach(other => {
                if (other.userId.toString() !== submission.userId.toString()) {
                    if (similarityCheck(submission.code, other.code) > 0.8) {
                        plagiarismPenalty += 200; // Deduct points if plagiarism is detected
                    }
                }
            });
            
            score += timeFactor - plagiarismPenalty;
        }
    });
    
    // Bonus for completing all questions
    if (submissions.length === totalQuestions) score += 500;
    
    return Math.max(score, 0); // Ensure non-negative score
};

// API for contest leaderboard
router.get('/leaderboard/:contestId', async (req, res) => {
    try {
        const { contestId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ error: 'Invalid contest ID' });
        }
        
        const userContests = await UserContest.find({ contestId }).populate('userId submissions.questionId');
        
        const allSubmissions = userContests.flatMap(uc => uc.submissions);
        
        const leaderboard = await Promise.all(userContests.map(async (uc) => {
            const user = await User.findById(uc.userId);
            const score = calculateScore(uc.submissions, allSubmissions);
            
            if (!user) {
                return {
                    userId: uc.userId,
                    name: 'Unknown',
                    email: 'Unknown',
                    score,
                };
            }

            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                score,
            };
        }));
        
        leaderboard.sort((a, b) => b.score - a.score);
        
        res.json({ contestId, leaderboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
