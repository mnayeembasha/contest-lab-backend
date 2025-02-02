import express from "express";
import {  runCode } from '../controller/runCode';
import { submitCode } from '../controller/submitCode';
import { question, getspecificquestion } from '../controller/getspecificquestion';
const router = express.Router();

router.get("/questions", question);
router.get("/questions/:id", getspecificquestion);
router.post("/run", runCode);
router.post("/submit", submitCode);

export default router;