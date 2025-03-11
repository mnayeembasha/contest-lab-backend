import mongoose from 'mongoose';
import axios from 'axios';
import { Question as QuestionModel } from '../models/questionModel';

const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';
import { JDOODLE_CLIENT_ID,JDOODLE_CLIENT_SECRET } from '../config';
const { Schema } = mongoose;

// const userContestSchema = new Schema({
// userId: {
//   type: Schema.Types.ObjectId,
//   ref: "User",
//   required: true,
// },
// contestId: {
//   type: Schema.Types.ObjectId,
//   ref: "Contest",
//   required: true,
// },
// totalScore: {
//   type: Number,
//   default: 0,
// },
// submissions: [
//   {
//     questionId: {
//       type: Schema.Types.ObjectId,
//       ref: "Question",
//       required: true,
//     },
//     language: {
//       type: String,
//       required: true,
//     },
//     code: {
//       type: String,
//       required: true,
//     },
//     submissionTime: {
//       type: Date,
//       default: Date.now,
//     },
//     isSubmitted: {
//       type: Boolean,
//       default: false,
//     },
//     score: {
//       type: Number,
//       default: 0,
//     },
//     timeTaken: {
//       type: Number,
//       default: 0,
//     },
//   },

// ],
// isCompleted: {
//   type: Boolean,
//   default: false,
// },
// });

// userContestSchema.post('save', async function (doc) {


//   try {

//     console.log("score is being calculated....")
//     let totalScore = 0;

//     for (const submission of doc.submissions) {
//       const question = await QuestionModel.findById(submission.questionId);
//       if (!question) continue;

//       const testCases = [...question.testCases, ...question.hiddenTestCases];
//       const inputs = testCases.map(tc => tc.input.trim()).join('\n');
//       const expectedOutputs = testCases.map(tc => tc.expected.trim());

//       const languageMapping = {
//         java: { language: 'java', versionIndex: '5' },
//         c: { language: 'c', versionIndex: '6' },
//         'c++': { language: 'cpp', versionIndex: '6' },
//         python: { language: 'python3', versionIndex: '5' },
//         javascript: { language: 'nodejs', versionIndex: '6' },
//       };

//       const { language, versionIndex } = languageMapping[submission.language];

//       const jdoodleRequest = {
//         clientId: JDOODLE_CLIENT_ID,
//         clientSecret: JDOODLE_CLIENT_SECRET,
//         script: submission.code,
//         stdin: inputs,
//         language,
//         versionIndex,
//       };

//       const response = await axios.post(JDOODLE_URL, jdoodleRequest);
//       const output = response.data.output?.trim().split('\n') || [];

//       let passedCount = 0;
//       for (let i = 0; i < expectedOutputs.length; i++) {
//         if (output[i]?.trim() === expectedOutputs[i]) {
//           passedCount++;
//         }
//       }

//       const score = (passedCount / testCases.length) * 100;
//       submission.score = score;
//       totalScore += score;
//     }

//     doc.totalScore = totalScore;
//     await doc.save();
//   } catch (error) {
//     console.error('Error calculating scores:', error);
//   }
// });


const userContestSchema = new Schema({
  teckziteId: {
    type: String,
    required: true,
    unique:true,
  },
  contestId: {
    type: Schema.Types.ObjectId,
    ref: "Contest",
    required: true,
  },
  submissions: [
    {
      questionId: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      language: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      submissionTime: {
        type: Date,
        default: Date.now,
      },
      isSubmitted: {
        type: Boolean,
        default: false,
      },
      testCasesPassed: {
        type: Number,
        default: 0,
      },
    },
  ],
  timeTaken: {
    type: Number,
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  noOfTestCasesPassed:{
    type:Number,
    default:0
  },
  totalScore:{
    type:Number,
    default:0
  },
  scoresCalculated: {
    type: Boolean,
    default: false,
  },
});

// let noOfTestCases = 0;
// userContestSchema.post('save', async function (doc, next) {
//   if (doc.isCompleted && !doc.scoresCalculated) {
//     let needsUpdate = false;
//     let totalScore =0;

//     for (const submission of doc.submissions) {
//       if (submission.testCasesPassed === 0) {
//         try {
//           const question = await QuestionModel.findById(submission.questionId);
//           if (!question) {
//             console.error(`Question not found: ${submission.questionId}`);
//             continue;
//           }

//           const passed = await evaluateCode(
//             submission.code,
//             submission.language,
//             question
//           );
//           submission.testCasesPassed = passed;
//           totalScore+=passed;
//           needsUpdate = true;
//         } catch (error) {
//           console.error('Error evaluating code:', error);
//           submission.testCasesPassed = 0;
//           needsUpdate = true;
//         }
//       }
//     }

//     if (needsUpdate) {
//       doc.scoresCalculated = true;
//       doc.noOfTestCasesPassed=totalScore;
//       console.log("no of test cases passed = ", totalScore);
//       doc.totalScore=(totalScore/noOfTestCases)*100;
//       console.log("total score=",totalScore);

//       await doc.save();
//     }
//   }

//   next();
// });


// const suppLangAndVIndex = {
//   java: {
//     languageCode: "java",
//     versionIndex: 5,
//   },
//   c: {
//     languageCode: "c",
//     versionIndex: 6,
//   },
//   "c++": {
//     languageCode: "cpp",
//     versionIndex: 6,
//   },
//   python: {
//     languageCode: "python3",
//     versionIndex: 5,
//   },
//   javascript: {
//     languageCode: "nodejs",
//     versionIndex: 6,
//   },
// };

// async function evaluateCode(
//   code: string,
//   language: string,
//   question: any
// ): Promise<number> {
//   const langConfig = suppLangAndVIndex[language];
//   if (!langConfig) {
//     throw new Error("Unsupported language");
//   }

//   const { languageCode, versionIndex } = langConfig;
//   const allTestCases = [
//     ...question.testCases,
//     ...question.hiddenTestCases,
//   ];
//   noOfTestCases +=allTestCases.length;

//   const inputs = allTestCases.map((tc) => tc.input.trim());
//   const expectedOutputs = allTestCases.map((tc) => tc.expected.trim());

//   const payload = {
//     clientId: JDOODLE_CLIENT_ID,
//     clientSecret: JDOODLE_CLIENT_SECRET,
//     script: code,
//     stdin: inputs.join("\n"),
//     language: languageCode,
//     versionIndex: versionIndex.toString(),
//   };

//   try {
//     console.log("code is being evaluated...");
//     const response = await axios.post(JDOODLE_URL, payload);
//     const output = response.data.output?.trim() || "";
//     const outputLines = output.split("\n").map((line) => line.trim());

//     let passed = 0;
//     for (let i = 0; i < allTestCases.length; i++) {
//       const expected = expectedOutputs[i];
//       const actual = outputLines[i] || "";
//       if (actual === expected) {
//         passed++;
//       }
//     }
//     console.log("question=",question.slug);
//     console.log("no of test cases passed=",passed);

//     return passed;
//   } catch (error) {
//     console.error("Jdoodle API error:", error.response?.data || error.message);
//     return 0;
//   }
// }

export const UserContest = mongoose.model("UserContest", userContestSchema);
