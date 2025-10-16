import express from "express";
import { getUserRequests, createRequest, updateRequestStatus } from "../controllers/requestController.js";

const router = express.Router();

router.get("/", getUserRequests);   
router.post("/", createRequest);            
router.put("/update-status", updateRequestStatus); 

export default router;
