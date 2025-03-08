import { JWT_SECRET, TECKZITE_USER_PASSWORD } from "../config";
import jwt from "jsonwebtoken";
import { teckziteUserModel } from "../models/teckziteUserModel";
import { Request,Response } from "express";
import dotenv from "dotenv";
dotenv.config();

export interface TeckziteUserDocument extends Document {
  teckziteId: string;
  // email: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TeckziteUserDocument;
}
export const addTeckziteIds = async (req, res) => {
  const { teckziteIds } = req.body;
  try{
    for (let teckziteId of teckziteIds) {
        await teckziteUserModel.create({ teckziteId });
      }
  }
  catch(err){
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const teckziteLoginHandler = async (req, res) => {
  const { teckziteId,password } = req.body;

  if (!teckziteId && !password) {
    return res.status(401).json({ message: "Teckzite ID is required" });
  }

  try {
    const user = await teckziteUserModel.findOne({ teckziteId });
    console.log("teckzite user id=",teckziteId);
    console.log("teckzite user password=",password);
    if (user===null) {
      return res.status(401).json({ message: "User Not Found" });
    }


    if (user?.teckziteId === teckziteId && password === TECKZITE_USER_PASSWORD) {
      const token = jwt.sign({ teckziteId: user?.teckziteId }, JWT_SECRET! , { expiresIn: "1d" });

      res.cookie("token", token, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ message: "Login Successfull", teckziteId });

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
      // name: req.user.name,
    },
  });
};

export const signOut = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({ message: "Signout successful" });
};
