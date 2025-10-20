import express from "express";
import { sendMoney, getTransfersByEmail } from "../controllers/transferController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/transfers/send
router.post("/send", sendMoney);

// GET /api/transfers?email=user@example.com
router.get("/", verifyJWT, getTransfersByEmail);

export default router;
