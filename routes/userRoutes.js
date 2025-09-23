import express from "express";
import { addUser, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/", addUser);
router.get("/", getUsers);

export default router;
