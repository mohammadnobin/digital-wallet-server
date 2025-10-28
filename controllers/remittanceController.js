import mongoose from "mongoose";
import User from "../models/userModel.js";
import Remittance from "../models/RemittanceModel.js";
import { addTransaction } from "../helpers/transactionService.js";

const exchangeRates = {
  USD: { BDT: 110.45 },
  BDT: { USD: 0.009 },
};

export const sendRemittance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderEmail, receiverEmail, amount } = req.body;

    if (!senderEmail || !receiverEmail || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const sender = await User.findOne({ email: senderEmail }).session(session);
    const receiver = await User.findOne({ email: receiverEmail }).session(session);

    if (!sender || !receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (
      (sender.currency === "USD" && receiver.currency !== "BDT") ||
      (sender.currency === "BDT" && receiver.currency !== "USD")
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Only USD ↔ BDT remittance allowed",
      });
    }

    const rate = exchangeRates[sender.currency][receiver.currency];
    const amountSent = parseFloat(amount);
    const amountReceived = parseFloat((amountSent * rate).toFixed(2));

    if (isNaN(amountSent) || amountSent <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (sender.balance < amountSent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const senderBalanceBefore = sender.balance;
    const receiverBalanceBefore = receiver.balance;

    sender.balance -= amountSent;
    receiver.balance += amountReceived;

    await sender.save({ session });
    await receiver.save({ session });

    const remittance = await Remittance.create(
      [
        {
          senderEmail,
          receiverEmail,
          amountSent,
          amountReceived,
          fromCurrency: sender.currency,
          toCurrency: receiver.currency,
          rateUsed: rate,
          status: "Completed",
        },
      ],
      { session }
    );
const io = req.app.get("io");
    await addTransaction(
      {
        senderId: sender._id,
        receiverId: receiver._id,
        type: "sendmoney",
        amount: amountSent,
        currency: sender.currency,
        status: "completed",
        meta: {
          rate,
          fromCurrency: sender.currency,
          toCurrency: receiver.currency,
          amountSent,
          amountReceived,
          remittanceId: remittance[0]._id,
        },
      },
      session, io
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Remittance sent successfully!",
      data: {
        amountSent,
        amountReceived,
        fromCurrency: sender.currency,
        toCurrency: receiver.currency,
        rateUsed: rate,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Get user remittance history
export const getUserRemittances = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const sent = await Remittance.find({ senderEmail: email }).sort({ createdAt: -1 });
    const received = await Remittance.find({ receiverEmail: email }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { sent, received } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
