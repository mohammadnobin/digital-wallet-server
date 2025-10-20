import mongoose from "mongoose";
import Transfer from "../models/transferModel.js";
import User from "../models/userModel.js";
import { addTransaction } from "../helpers/transactionService.js";

export const sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderEmail, recipientEmail, amount, speed, message } = req.body;

    if (!senderEmail || !recipientEmail || !amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields." });
    }

    const sender = await User.findOne({ email: senderEmail }).session(session);
    const recipient = await User.findOne({ email: recipientEmail }).session(session);

    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sender not found." });
    }
    if (!recipient) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Recipient not found or invalid email." });
    }

    const fee = speed === "instant" ? 1.99 : 0;
    const totalDeduct = parseFloat(amount) + fee;

    if (sender.balance < totalDeduct) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // ✅ Update balances
    sender.balance -= totalDeduct;
    recipient.balance += parseFloat(amount);

    await sender.save({ session });
    await recipient.save({ session });

    // ✅ Save transfer record
    const transfer = await Transfer.create(
      [
        {
          senderEmail,
          recipientEmail,
          amount,
          speed,
          message,
          fee,
          status: "completed",
        },
      ],
      { session }
    );

    // ✅ Add transaction history
    // Sender
    await addTransaction(
      {
        userId: sender._id,
        type: "sendmoney",
        amount: parseFloat(amount),
        meta: {
          toUserEmail: recipient.email,
          fee,
          speed,
          transferId: transfer[0]._id,
        },
        status: "completed",
      },
      session
    );

    // Recipient
    await addTransaction(
      {
        userId: recipient._id,
        type: "addmoney",
        amount: parseFloat(amount),
        meta: {
          fromUserEmail: sender.email,
          speed,
          transferId: transfer[0]._id,
        },
        status: "completed",
      },
      session
    );

    // ✅ Commit MongoDB transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: `Successfully sent $${amount} to ${recipientEmail}`,
      transfer: transfer[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Send money error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getTransfersByEmail = async (req, res) => {
  try {
    const email = req.user?.email;

    if (!email) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Email missing in token." });
    }

    const transfers = await Transfer.find({
      $or: [{ senderEmail: email }, { recipientEmail: email }],
    }).sort({ createdAt: -1 });

    res.status(200).json(transfers);
  } catch (error) {
    console.error("Get transfers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
