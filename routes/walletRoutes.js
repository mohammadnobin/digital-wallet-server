import express from "express";
import { addMoney, cashout, current } from "../controllers/walletController.js";

const router = express.Router();

router.post("/addmoney/",  addMoney);
router.post("/cashout/",  cashout);
router.get("/current/",  current);

export default router;
