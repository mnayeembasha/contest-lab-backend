import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { teckziteUserModel } from "../models/teckziteUserModel";
import { AuthenticatedRequest } from "../controller/teckziteLoginHandler.js";
import { JWT_SECRET } from "../config";


interface DecodedToken extends JwtPayload {
  teckziteId: string;
}

export const isTeckziteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log("cookies=",req.cookies);
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET!) as DecodedToken;
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    const user = await teckziteUserModel.findOne({ teckziteId: decoded.teckziteId });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user; // Now TypeScript recognizes this
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
