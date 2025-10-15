import express from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { addCard, getMyCards } from "../controllers/cardController.js";

const router = express.Router();

// POST /api/cards/add
router.post("/add", verifyJWT, addCard);

// GET /api/cards/my-cards
router.get("/my-cards", verifyJWT, getMyCards);

export default router;
