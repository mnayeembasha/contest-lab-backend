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
// Allowed origins
const allowedOrigins = [
  "https://contest-lab.vercel.app",
  "http://localhost:3001" 
];

// CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Additional headers in case CORS still causes issues
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://contest-lab.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
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
