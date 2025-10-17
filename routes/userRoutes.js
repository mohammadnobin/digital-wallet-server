import express from "express";
import {
  getUserByEmail,
  getUsers,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", registerUser);
router.post("/login", loginUser)
router.post("/logout",   logoutUser);
router.get("/", getUsers);
router.get("/email", getUserByEmail);

export default router;
