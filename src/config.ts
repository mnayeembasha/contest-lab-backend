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
export const JWT_SECRET = process.env.JWT_SECRET;
export const TECKZITE_USER_PASSWORD = process.env.TECKZITE_USER_PASSWORD;
// export const FRONTEND_URL='http://localhost:3001'
export const FRONTEND_URL='https://contest-lab.vercel.app'