// routes/cards.js
import express from "express";
import { getMyCards, addCard, updateCard, deleteCard } from "../controllers/cardController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
const router = express.Router();


router.get("/my-cards",verifyJWT, getMyCards);
router.post("/add",verifyJWT, addCard);
router.put("/:id",verifyJWT, updateCard);
router.delete("/:id",verifyJWT, deleteCard);

export default router;
