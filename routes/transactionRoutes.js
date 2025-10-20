// routes/transactionRoutes.js
import express from "express";
import { getMyTransactions } from "../controllers/transactionController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my", verifyJWT, getMyTransactions);

export default router;
