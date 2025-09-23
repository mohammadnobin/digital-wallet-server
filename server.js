import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Digital Wallet API running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
