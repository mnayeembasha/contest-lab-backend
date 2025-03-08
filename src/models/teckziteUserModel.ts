import mongoose, { Schema } from "mongoose";

interface IUser extends Document {
  teckziteId: string;
  name?:string;
}

const teckziteUserSchema = new Schema<IUser>({
  teckziteId: {
    type: String,
    required: true,
    unique: true,
  },
});
export const teckziteUserModel = mongoose.model<IUser>(
  "TeckziteUser",
  teckziteUserSchema
);


