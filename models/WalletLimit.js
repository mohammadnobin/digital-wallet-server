import mongoose from "mongoose";

const walletLimitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  amountUsed: {
    type: Number,
    default: 0,
  },
});

const WalletLimit =
  mongoose.models.WalletLimit ||
  mongoose.model("WalletLimit", walletLimitSchema);
export default WalletLimit;
