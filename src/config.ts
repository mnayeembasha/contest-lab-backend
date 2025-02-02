import dotenv from "dotenv";
dotenv.config();

export const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;
export const PORT = process.env.PORT || 3000;
export const MONGO_URL = process.env.MONGO_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
export const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;
export const SESSION_SECRET = process.env.SESSION_SECRET;