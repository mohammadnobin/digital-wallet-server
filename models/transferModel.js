import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    speed: {
      type: String,
      enum: ["instant", "standard"],
      default: "standard",
    },
    message: {
      type: String,
      maxlength: 500,
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
    transactionId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate transaction ID
transferSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId = "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  }
  next();
});

const Transfer = mongoose.model("Transfer", transferSchema);
export default Transfer;
