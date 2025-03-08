// import {  Request, Response,NextFunction } from "express";
// import "express-session";



//   declare module "express-session" {
//     interface SessionData {
//         passport?: {
//             user?: {
//                 _id: string;
//                 name: string;
//                 email: string;
//                 avatarUrl?: string;
//             };
//         };
//     }
// }


// export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Check Google OAuth session user
//         if (req.session?.passport?.user) {
//             const { _id, name, email, avatarUrl } = req.session.passport.user;
//             req.user = { id: _id, name, email, avatarUrl: avatarUrl };
//             return next();
//         }

//         // If no authentication method is found
//          res.status(401).json({ message: "Unauthorized user" });
//          return;

//     } catch (error: any) {
//          res.status(500).json({ message:"Failed to Login with Google" });
//          return;
//     }
// };
