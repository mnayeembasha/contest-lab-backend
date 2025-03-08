import express from "express";
import { addTeckziteIds, getMe, signOut, teckziteLoginHandler } from "../controller/teckziteLoginHandler";
import { isTeckziteUser } from "../middleware/teckziteUserMiddleware";
import { RequestHandler } from "express";

const teckziteRouter = express.Router();

// Ensure handlers are typed correctly
teckziteRouter.post("/addIds", addTeckziteIds as RequestHandler);
teckziteRouter.post("/login", teckziteLoginHandler as RequestHandler);
teckziteRouter.get("/me", isTeckziteUser as RequestHandler, getMe as RequestHandler);
teckziteRouter.post("/signOut", isTeckziteUser as RequestHandler, signOut as RequestHandler);

export default teckziteRouter;
