import { JWT_SECRET, TECKZITE_USER_PASSWORD } from "../config";
import jwt from "jsonwebtoken";
import { teckziteUserModel } from "../models/teckziteUserModel";
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

export interface TeckziteUserDocument extends Document {
  teckziteId: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TeckziteUserDocument;
}

export const teckziteLoginHandler = async (req: Request, res: Response) => {
  const { teckziteId, password } = req.body;

  if (!teckziteId || !password) {
    return res.status(401).json({ message: "Teckzite ID and password are required" });
  }

  try {
    const user = await teckziteUserModel.findOne({ teckziteId });

    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    if (user.teckziteId === teckziteId && password === TECKZITE_USER_PASSWORD) {
      const token = jwt.sign({ teckziteId: user.teckziteId }, JWT_SECRET!, { expiresIn: "1d" });

      // Ensure NODE_ENV is defined
      if (!process.env.NODE_ENV) {
        return res.status(500).json({ message: "NODE_ENV is not set" });
      }

      // Set the cookie correctly
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure only in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site in production
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.status(200).json({ message: "Login Successful", teckziteId });
    }

    return res.status(401).json({ message: "Invalid Credentials" });
  } catch (err) {
    console.error("Error in teckziteLoginHandler:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signOut = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({ message: "Signout successful" });
};
