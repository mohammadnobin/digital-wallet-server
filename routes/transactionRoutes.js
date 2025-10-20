// routes/transactionRoutes.js
import express from "express";
import { getMyTransactions, getTransactionSummary } from "../controllers/transactionController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my", verifyJWT, getMyTransactions);
router.get("/summary", verifyJWT, getTransactionSummary);


export default router;
