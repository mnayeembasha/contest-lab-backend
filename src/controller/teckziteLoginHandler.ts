import { JWT_SECRET, TECKZITE_USER_PASSWORD } from "../config";
import jwt from "jsonwebtoken";
import { teckziteUserModel } from "../models/teckziteUserModel";
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

export interface TeckziteUserDocument {
  teckziteId: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TeckziteUserDocument;
}

export const addTeckziteIds = async (req: Request, res: Response) => {
  const { teckziteIds } = req.body;
  try {
    for (let teckziteId of teckziteIds) {
      await teckziteUserModel.create({ teckziteId });
    }
    return res.status(201).json({ message: "Users added successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const teckziteLoginHandler = async (req: Request, res: Response) => {
  const { teckziteId, password } = req.body;

  if (!teckziteId || !password) {
    return res.status(400).json({ message: "Teckzite ID and password are required" });
  }

  try {
    const user = await teckziteUserModel.findOne({ teckziteId });
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    if (user.teckziteId === teckziteId && password === TECKZITE_USER_PASSWORD) {
      const token = jwt.sign({ teckziteId: user.teckziteId }, JWT_SECRET!, { expiresIn: "1d" });
      return res.status(200).json({ message: "Login Successful", token ,teckziteId});
    }
    return res.status(401).json({ message: "Invalid Credentials" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: User not logged in" });
  }

  return res.status(200).json({
    message: "User authenticated",
    user: {
      teckziteId: req.user.teckziteId,
    },
  });
};

export const signOut = (req: Request, res: Response) => {
  return res.status(200).json({ message: "Signout successful" });
};
