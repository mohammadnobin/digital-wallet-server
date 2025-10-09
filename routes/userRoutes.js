import express from "express";
import {
  addUser,
  getUserByEmail,
  getUsers,
  login,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/post", addUser);
router.post("/login", login);

router.get("/", getUsers);
router.get("/email", getUserByEmail);

export default router;
