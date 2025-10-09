import express from "express";
import {
  addUser,
  getUserByEmail,
  getUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", addUser);
router.get("/", getUsers);
router.get("/email", getUserByEmail);

export default router;
