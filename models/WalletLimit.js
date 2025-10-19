import mongoose from "mongoose";


const walletLimitSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
  },
  date: {
    type: Date,
    default: new Date(),
  },
  amountUsed: {
    type: Number,
    default: 0,
  },
  amountAdded: {
    type: Number,
    default: 0,
  },
  method: {
    type: String,
    enum: ["bank", "card", "mobile"],
  },
  details: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WalletLimit =
  mongoose.models.WalletLimit ||
  mongoose.model("WalletLimit", walletLimitSchema);

export default WalletLimit;
