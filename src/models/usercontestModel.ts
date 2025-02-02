import  mongoose from 'mongoose';
const { Schema } = mongoose;
const userContestSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    contestId: {
      type: Schema.Types.ObjectId,
      ref: 'Contest'
    },
    submissions: [{
      questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question'
      },
      code: String, // User's code for the question
      submissionTime: Date,
      isSubmitted: {
        type: Boolean,
        default: false
      },
      timeTaken: Number // in seconds
    }],
    isCompleted: {
      type: Boolean,
      default: false
    }
  });

  export const UserContest = mongoose.model('UserContest', userContestSchema);
