import express from "express";
import { getUserRequests, createRequest, updateRequestStatus } from "../controllers/requestController.js";

const router = express.Router();

router.get("/", getUserRequests);           // ইউজারের request (pending + history)
router.post("/", createRequest);            // নতুন request
router.put("/update-status", updateRequestStatus); // Approve / Decline

export default router;
