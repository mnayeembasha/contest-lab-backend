import mongoose, { Schema } from "mongoose";

interface IUser extends Document {
  teckziteId: string;
  usageCount:number;
  name?:string;
}

const teckziteUserSchema = new Schema<IUser>({
  teckziteId: {
    type: String,
    required: true,
    unique: true,
  },
  name:{
    type:String
  },
  usageCount:{
    type:Number,
    default:0
  }
});
export const teckziteUserModel = mongoose.model<IUser>(
  "TeckziteUser",
  teckziteUserSchema
);


