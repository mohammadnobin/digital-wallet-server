// routes/splitBillRoutes.js
import express from "express";
import {
  createBill,
  deleteBill,
  getBills,
} from "../controllers/billController.js";

const router = express.Router();

// create new bill
router.post("/", createBill);

// get bills (optionally filter by user)
router.get("/", getBills);
// DELETE a bill
router.delete("/bill/:id", deleteBill);

export default router;
