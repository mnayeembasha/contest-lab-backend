import { Router,Request,Response } from "express";
import passport from "passport";
import { isAuthenticated } from "../middleware/authMiddleware";
import { User } from "../models/userModel";
import dotenv from "dotenv";
dotenv.config();


const authRouter = Router();

// Redirect to Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    successRedirect: "http://localhost:3001/profile", // Redirect to frontend
  })
);

authRouter.get("/failure", (req, res) => {
  res.status(401).json({ message: "OAuth Login Failed" });
  res.redirect(
    "http://localhost:3001/login?errorMessage=OAuth%20Login%20Failed"
  );
});

authRouter.post("/signout",isAuthenticated,(req:Request,res:Response)=> {
  const sessionUser = req.session?.passport?.user;

  if (!sessionUser) {
     res.status(401).json({ message: "Not logged in" });
     return;
  }


  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out", error: err.message });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error destroying session", error: err.message });
      }

      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

authRouter.get("/me",isAuthenticated,async(req:Request,res:Response)=>{
const userId= req.session?.passport?.user?._id;
 try{
    const user = await User.findById(userId);
    res.status(200).json({
      message:"User details fetched successfully...",
      "user":{
        id:user?._id.toString(),
        name: user?.name ,
        email: user?.email,
        avatarUrl: user?.avatarUrl
      },
    });
 }catch(error){
    res.status(400).json({message:"failed to fetch user details","error":error.errors});
 }
})

export default authRouter;
