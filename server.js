// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import userRoutes from "./routes/userRoutes.js";
// import walletRoutes from "./routes/walletRoutes.js";
// import requestRoutes from "./routes/requestRoutes.js";
// import remittanceRoutes from "./routes/remittanceRoutes.js";
// import cardsRoutes from "./routes/cardRoutes.js";
// import splitBillRoutes from "./routes/billRoutes.js";
// import transferRoutes from "./routes/transferRoutes.js";
// import transactionRoutes from "./routes/transactionRoutes.js";
// import billRoutes from "./routes/billlsRoutes.js";
// import connectDB from "./config/db.js";
// import cookieParser from "cookie-parser";

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cookieParser());
// app.use(cors({
//   origin: ["http://localhost:3000","https://digital-wallet-sage.vercel.app"],
//   credentials: true
// }));
// app.use(express.json());

// // Connect MongoDB system
// connectDB();

// // Routes
// app.use("/api/users", userRoutes);
// app.use("/api/wallets", walletRoutes);
// app.use("/api/requests", requestRoutes)
// app.use("/api/remittance", remittanceRoutes);
// app.use("/api/cards", cardsRoutes);
// app.use("/api/splitbills", splitBillRoutes);
// app.use("/api/transfers", transferRoutes );
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/bills", billRoutes);
// // Default route
// app.get("/", (req, res) => {
//   res.send("Digital Wallet API running...");
// });

// // Start server
// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );
// export default app;



// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import remittanceRoutes from "./routes/remittanceRoutes.js";
import cardsRoutes from "./routes/cardRoutes.js";
import splitBillRoutes from "./routes/billRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import billRoutes from "./routes/billlsRoutes.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);

// ✅ Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://digital-wallet-sage.vercel.app","https://digital-wallet-3zky.vercel.app"],
     methods: ["GET", "POST"],
    credentials: true,
  },
});

// Global socket reference
app.set("io", io);

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://digital-wallet-sage.vercel.app","https://digital-wallet-3zky.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/remittance", remittanceRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/api/splitbills", splitBillRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bills", billRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("💸 Digital Wallet API running with Socket.IO!");
});

// ✅ Socket.io connection
io.on("connection", (socket) => {

  socket.on("join", (email) => {
    if (email) {
      socket.join(email);
    }
  });

  socket.on("disconnect", () => {
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

export default app;
