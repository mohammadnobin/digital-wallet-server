import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardNumber: { type: String, required: true },
    holderName: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);
export default Card;
