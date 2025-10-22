import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "overdue", "paid"],
      default: "pending",
    },
    daysOverdue: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: String,
      required: true,
    },
    autoPay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "bg-blue-500",
    },
    icon: {
      type: String,
      default: "Zap",
    },
    userEmail: {
      type: String,
      required: true, // যাতে user ভিত্তিক bill store হয়
    },
  },
  { timestamps: true }
);

export const Bill = mongoose.model("Bill", billSchema);
