// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config";
// import { User } from "../models/userModel";

// GoogleStrategy.prototype.authorizationParams = function () {
//   return { prompt: "select_account" };
// };

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID!,
//       clientSecret: GOOGLE_CLIENT_SECRET!,
//       callbackURL: "/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//           let user = await User.findOne({ email: profile.emails?.[0].value });

//           if (!user) {
//             user = await User.create({
//               googleId: profile.id,
//               name: profile.displayName,
//               email: profile.emails?.[0].value,
//               avatarUrl: profile.photos?.[0].value || "",
//             });
//           } else {
//             // Update existing user with latest avatar URL
//             user.avatarUrl = profile.photos?.[0].value || user.avatarUrl;
//             await user.save();
//           }

//           done(null, user);
//         } catch (error) {
//           done(error, undefined);
//         }
//       }
//   )
// );


// passport.serializeUser((user: any, done) => {
//   done(null, {
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     avatarUrl: user.avatarUrl,
//   });
// });

// passport.deserializeUser((user: any, done) => {
//   done(null, user);
// });
