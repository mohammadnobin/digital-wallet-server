import express from "express";
import {
  deleteUser,
  getUserByEmail,
  getUsers,
  loginUser,
  logoutUser,
  registerUser,
  toggleUserStatus,
  updateUserRole,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", registerUser);
router.post("/login", loginUser)
router.post("/logout",   logoutUser);
router.get("/", getUsers);
router.get("/email", getUserByEmail);
router.patch("/role", updateUserRole);
router.patch("/status", toggleUserStatus);
router.delete("/:userId", deleteUser);

export default router;
