import mongoose from "mongoose";
import { JDOODLE_KEYS } from "../config";

const apiKeySchema = new mongoose.Schema({
  clientId: String,
  clientSecret: String,
  usageCount: { type: Number, default: 0 },
  limit: { type: Number, default: 22 },
});

export const ApiKey = mongoose.model("ApiKey", apiKeySchema);

export const initializeApiKeys = async () => {
  const keys = JSON.parse(JDOODLE_KEYS || "[]");
  console.log("keys parsed");
  for (const key of keys) {
    const existingKey = await ApiKey.findOne({ clientId: key.clientId });
    if (!existingKey) {
      await new ApiKey({
        clientId: key.clientId,
        clientSecret: key.clientSecret,
      }).save();
    }
  }

  console.log("API Keys Initialized");
};
