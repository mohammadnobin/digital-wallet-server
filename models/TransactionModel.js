// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   type: { type: String,    enum: [
//     "addmoney",
//     "sendmoney",
//     "cashout",
//     "refund",
//     "fee",
//     "request_sent",
//     "request_received",
//     "request_accepted",
//     "request_paid",
//     "request_declined",
//     "request_declined",
//     "incoming_request",
//     "bill_payment"
//   ], required: true },
//   amount: { type: Number, required: true, min: 0 },
//   currency: { type: String, default: "BDT" },
//   status: { type: String, enum: ["pending","completed","failed"], default: "pending" },
//   meta: { type: Object, default: {} },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// transactionSchema.index({ userId: 1, createdAt: -1 });

// export default mongoose.models.TransactionHistory ||
//   mongoose.model("TransactionHistory", transactionSchema);



import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    type: {
      type: String,
      enum: [
        "addmoney",
        "sendmoney",
        "cashout",
        "refund",
        "fee",
        "request_sent",
        "request_received",
        "request_created",
        "request_approved",
        "add_card",
        "request_accepted",
        "request_paid",
        "request_declined",
        "incoming_request",
        "bill_payment",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("TransactionHistory", transactionSchema);
