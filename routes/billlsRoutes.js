import express from "express";
import { addBill, getBills, deleteBill, updateBill, payBill } from "../controllers/billlsController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", addBill);
router.get("/", verifyJWT, getBills);
router.delete("/:id", deleteBill);
router.patch("/:id", updateBill);
router.patch("/pay/:id", verifyJWT, payBill);


export default router;
