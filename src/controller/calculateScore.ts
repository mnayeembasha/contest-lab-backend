// import axios from 'axios';
// import { UserContest } from '../models/usercontestModel';
// import { Question } from '../models/questionModel';
// import { JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET } from '../config';

// const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';

// const calculateUserScore = async (userContestId) => {
//   try {
//     // Retrieve the user contest record
//     const userContest = await UserContest.findById(userContestId).populate('submissions.questionId');
//     if (!userContest) {
//       throw new Error('User contest not found.');
//     }

//     let totalScore = 0;

//     // Iterate over each submission
//     for (const submission of userContest.submissions) {
//       const { questionId, language, code } = submission;
//       const question = await Question.findById(questionId);

//       if (!question) {
//         console.warn(`Question not found for ID: ${questionId}`);
//         continue;
//       }

//       const allTestCases = [...question.testCases, ...question.hiddenTestCases];
//       let passedTestCases = 0;

//       // Execute code for each test case
//       for (const testCase of allTestCases) {
//         const { input, expected } = testCase;

//         const jdoodleRequest = {
//           clientId: JDOODLE_CLIENT_ID,
//           clientSecret: JDOODLE_CLIENT_SECRET,
//           script: code,
//           stdin: input,
//           language,
//           versionIndex: '0', // Adjust based on language version
//         };

//         const response = await axios.post(JDOODLE_URL, jdoodleRequest);
//         const output = response.data.output?.trim();

//         if (output === expected.trim()) {
//           passedTestCases++;
//         }
//       }

//       // Calculate score for this submission
//       const score = (passedTestCases / allTestCases.length) * 100; // Example scoring
//       submission.score = score;
//       totalScore += score;
//     }

//     // Update the user contest record with the total score
//     userContest.totalScore = totalScore;
//     await userContest.save();

//     console.log('User score calculated and updated successfully.');
//   } catch (error) {
//     console.error('Error calculating user score:', error);
//   }
// };
