import createError,{HttpError} from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import questionsRouter from "./routes/questionsroute";
import indexRouter from "./routes/index";
import authRouter from "./routes/authroutes";
import contestRouter from "./routes/contestroutes";
import { MONGO_URL, PORT, SESSION_SECRET } from "./config";
import passport from "passport";
import session from "express-session";
import "./passport-auth/passport";
import dotenv from "dotenv";
dotenv.config();

// Initialize Express App
const app: express.Application = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
  origin: ["http://localhost:3001", "https://contest-lab.vercel.app/"],
  credentials: true }));
app.use(cookieParser());

app.use(
  session({
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", questionsRouter);
app.use("/api", contestRouter);
app.use("/", indexRouter);
app.use("/auth", authRouter);

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: HttpError, req: Request, res: Response) => {
  // Ensure err is an instance of Error
  if (err instanceof Error) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
  } else {
    res.locals.message = "Unknown error occurred";
    res.locals.error = {};
  }

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});



mongoose
  .connect( MONGO_URL || "mongodb://localhost:27017/coding-competition")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
