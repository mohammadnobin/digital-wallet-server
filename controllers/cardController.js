// controllers/cardsController.js
import mongoose from "mongoose";
import Card from "../models/cardModel.js";
import { addTransaction } from "../helpers/transactionService.js";

export const addCard = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { cardName, cardNumber, expiryDate, cardType, balance, bank } = req.body;

    if (!cardName || !cardNumber || !expiryDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields" });
    }

    const card = new Card({
      user: userId,
      cardName,
      cardNumber,
      expiryDate,
      cardType,
      balance: Number(balance) || 0,
      meta: { bank, last4: cardNumber.slice(-4) },
    });

    await card.save({ session });

    const user = req.user; 
    const userBalanceBefore = Number(balance) ? user.balance - Number(balance) : user.balance;
const io = req.app.get("io");
    await addTransaction(
      {
        senderId: user._id,
        receiverId: null,
        type: "add_card",
        amount: Number(balance) || 0,
        currency: user.currency || "BDT",
        status: "completed",
        meta: {
          cardId: card._id,
          cardName,
          last4: cardNumber.slice(-4),
          bank,
          message: `New card added: ${cardName} (${cardNumber.slice(-4)})`,
          userEmail: user.email,
          userBalanceBefore,
          userBalanceAfter: user.balance,
        },
      },
      session, io
    );

    await session.commitTransaction();
    session.endSession();

    const obj = card.toObject();
    delete obj.cardNumber; 

    return res.status(201).json({
      success: true,
      message: "Card added successfully",
      data: obj,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyCards = async (req, res) => {
  try {
    const userId = req.user._id;
    const cards = await Card.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return res.json(cards);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const cardId = req.params.id;
    const payload = { ...req.body };
    delete payload.user;
    const card = await Card.findOneAndUpdate({ _id: cardId, user: userId }, payload, { new: true });
    if (!card) return res.status(404).json({ message: "Card not found" });
    const obj = card.toObject();
    delete obj.cardNumber;
    return res.json(obj);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const cardId = req.params.id;
    const deleted = await Card.findOneAndDelete({ _id: cardId, user: userId });
    if (!deleted) return res.status(404).json({ message: "Card not found" });
    return res.json({ message: "Card deleted" });
  } catch (err) {

    return res.status(500).json({ message: "Server error" });
  }
};
