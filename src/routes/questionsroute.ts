import express from "express";
import {  runCode } from '../controller/runCode';
import { submitCode } from '../controller/submitCode';
import { question, getspecificquestion } from '../controller/getspecificquestion';
import { addQuestion } from "../controller/addQuestion";
import { isTeckziteUser } from "../middleware/teckziteUserMiddleware";
import { RequestHandler } from "express";
const router = express.Router();

router.get("/questions", question);
router.get("/questions/:id", getspecificquestion);
router.post("/questions/add",addQuestion);
router.post("/run",isTeckziteUser as RequestHandler,runCode as RequestHandler);
router.post("/submit", submitCode);

export default router;