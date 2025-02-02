import  mongoose from 'mongoose';
const { Schema } = mongoose;

const contestSchema = new Schema({
  title: String,
  startTime: Date,
  duration: Number,
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

export const Contest = mongoose.model('Contest', contestSchema);
