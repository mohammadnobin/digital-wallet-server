// models/Bill.js
import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  share: { type: Number, required: true },
  status: { type: String, enum: ["pending","paid","settled"], default: "pending" },
  paidAt: { type: Date, default: null },
});

const billSchema = new mongoose.Schema({
  title: { type: String, required: true },
  total: { type: Number, required: true },
  members: [memberSchema], // includes creator too (if creator is part of split)
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  // optional extra fields
  category: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.models.Bill || mongoose.model("Bill", billSchema);
