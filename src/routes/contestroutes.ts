import express from "express";
import { isTeckziteUser } from "../middleware/teckziteUserMiddleware";
// import { isAuthenticated } from "../middleware/authMiddleware";
const  router = express.Router();
var {createContest} = require('../controller/createContest');
var { joinContest } = require('../controller/joinContest');
var {stopContest} = require('../controller/stopContest');
var {submitContest} = require('../controller/submitContest');

// router.post('/create', createContest);
router.post('/join', joinContest);
router.post('/stop', stopContest);
router.post('/contest/submit', submitContest);

export default router;