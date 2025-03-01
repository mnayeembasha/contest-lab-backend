import  mongoose from 'mongoose';
const { Schema } = mongoose;

const contestSchema = new Schema({
  title: String,
  startTime: {type:Date,required:true},
  duration: {type:Number,required:true},
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
