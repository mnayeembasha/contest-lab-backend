import  mongoose from 'mongoose';
import { v4 as uuidv4 }  from 'uuid';
const { Schema } = mongoose;
const questionSchema = new Schema({
    _id: { type: String, default: uuidv4 },
    title: String,
    description: String,
    testCases: [{
      input: String,
      expected: String
    }]
  });

  export const Question = mongoose.model('Question', questionSchema);
