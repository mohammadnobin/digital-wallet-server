// routes/billRoutes.js
import express from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import {
  createBill,
  getMyBills,
  payMyShare,
  getBillById,
  deleteBill,
  getStats
} from "../controllers/billController.js";

const router = express.Router();

router.use(verifyJWT); // সব রুট প্রটেক্টেড

router.post("/", createBill);           // Create a bill
router.get("/", getMyBills);            // Get bills for current user (with ?tab=)
router.get("/stats", getStats);         // stats endpoint
router.get("/:id", getBillById);        // single bill
router.patch("/:id/pay", payMyShare);   // pay current user's share
router.delete("/:id", deleteBill);      // delete bill (creator/admin)

export default router;
