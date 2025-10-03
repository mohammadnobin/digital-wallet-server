import express from "express";
import { addMoney, cashout, current } from "../controllers/walletController.js";
import verifyFirebaseToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addmoney/", verifyFirebaseToken, addMoney);
router.post("/cashout/", verifyFirebaseToken, cashout);
router.get("/current/", verifyFirebaseToken, current);

export default router;
