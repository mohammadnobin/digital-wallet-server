import express from "express";
import { addUser, getUsers } from "../controllers/userController.js";
import verifyFirebaseToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", addUser);
router.get("/", verifyFirebaseToken, getUsers);

export default router;
