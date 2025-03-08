import createError,{HttpError} from "http-errors";
import express, { Request, Response, NextFunction } from "express";
// import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import questionsRouter from "./routes/questionsroute";
import indexRouter from "./routes/index";
import contestRouter from "./routes/contestroutes";
import { MONGO_URL, PORT } from "./config";
// import passport from "passport";
// import session from "express-session";
// import "./passport-auth/passport";
import dotenv from "dotenv";
import teckziteRouter from "./routes/teckziteRoutes";
dotenv.config();

// Initialize Express App
const app: express.Application = express();
app.use(cookieParser());

const allowedOrigins = ["http://localhost:3001", "https://contest-lab.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", (req, res) => {
  res.sendStatus(204);
});
// app.use(cors({origin:'http://localhost:3001',credentials:true}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// app.use(
//   session({
//     secret: SESSION_SECRET!,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     }
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// Routes
app.use("/api", questionsRouter);
app.use("/api", contestRouter);
app.use("/", indexRouter);
// app.use("/auth", authRouter);
app.use("/teckzite", teckziteRouter);

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}, // Hide errors in production
  });
});



mongoose
  .connect( MONGO_URL || "mongodb://localhost:27017/coding-competition")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
