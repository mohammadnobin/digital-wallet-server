import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["addmoney", "cashout", "sendmoney"], 
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["bank", "card", "mobile"],
  },
  details: {
    type: Object, 
  },
  fee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
