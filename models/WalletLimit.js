import mongoose from "mongoose";
// type: mongoose.Schema.Types.ObjectId,

const walletLimitSchema = new mongoose.Schema({
  user: {
    //
    type: String,
    ref: "User",
  },
  date: {
    type: Date,
    default: new Date(),
  },
  amountUsed: {
    type: Number,
    default: 0, // কত টাকা খরচ হয়েছে
  },
  amountAdded: {
    type: Number,
    default: 0, // কত টাকা addMoney দিয়ে যোগ হয়েছে
  },
  method: {
    type: String,
    enum: ["bank", "card", "mobile"],
  },
  details: {
    type: String, // extra info like reference / transactionId
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
