import mongoose from "mongoose";

const remittanceSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  amountSent: { type: Number, required: true },
  amountReceived: { type: Number, required: true },
  fromCurrency: { type: String, required: true },
  toCurrency: { type: String, required: true },
  rateUsed: { type: Number, required: true },
  status: { type: String, enum: ["Completed", "Failed"], default: "Completed" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Remittance", remittanceSchema);
