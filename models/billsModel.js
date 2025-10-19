// models/SplitBill.js
import mongoose from "mongoose";

const splitBillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  total: { type: Number, required: true },
  people: { type: Number, required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "settled"],
    default: "pending",
  },
  yourShare: { type: Number }, // total / people
  icon: { type: String, default: "Utensils" }, // icon name
  createdBy: { type: String, ref: "User", required: true }, // email or userId
  createdAt: { type: Date, default: Date.now },
});

const SplitBill =
  mongoose.models.SplitBill || mongoose.model("SplitBill", splitBillSchema);

export default SplitBill;
