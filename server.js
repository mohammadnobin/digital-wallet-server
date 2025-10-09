import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB system
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);
// Default route
app.get("/", (req, res) => {
  res.send("Digital Wallet API running...");
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
export default app;
