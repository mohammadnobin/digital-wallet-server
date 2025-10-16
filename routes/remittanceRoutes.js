import express from "express";
import { sendRemittance, getUserRemittances } from "../controllers/remittanceController.js";

const router = express.Router();

router.post("/send", sendRemittance);
router.get("/", getUserRemittances);

export default router;
