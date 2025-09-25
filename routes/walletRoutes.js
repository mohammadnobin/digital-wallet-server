import express from "express";
import { cashout } from "../controllers/walletController.js";

const router = express.Router();

router.post("/", cashout);

export default router;
