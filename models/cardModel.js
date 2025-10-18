// import mongoose from "mongoose";

// const cardSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     cardNumber: { type: String, required: true },
//     holderName: { type: String, required: true },
//     expiryDate: { type: String, required: true },
//     cvv: { type: String, required: true },
//   },
//   { timestamps: true }
// );

import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardName: { type: String, required: true },
  cardNumber: { type: String, required: true }, // production: encrypt/tokenize!
  expiryDate: { type: String, required: true }, // MM/YY
  cardType: { type: String, default: "Visa" },
  balance: { type: Number, default: 0 },
  meta: {
    bank: String,
    last4: String,
  },
}, {
  timestamps: true,
});

cardSchema.pre("save", function (next) {
  // store last4 in meta for convenience
  if (this.cardNumber) {
    this.meta = this.meta || {};
    this.meta.last4 = this.cardNumber.slice(-4);
  }
  next();
});
const Card = mongoose.model("Card", cardSchema);
export default Card;
