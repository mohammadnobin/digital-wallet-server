import mongoose from "mongoose";
import Request from "../models/RequestModel.js";
import User from "../models/userModel.js";
import { addTransaction } from "../helpers/transactionService.js";

// ✅ Get user requests (sent + received)
export const getUserRequests = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const sent = await Request.find({ senderEmail: email }).sort({ createdAt: -1 });
    const received = await Request.find({ receiverEmail: email }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { sent, received } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create a new request
export const createRequest = async (req, res) => {
  try {
    const { senderEmail, receiverEmail, amount, category, dueDate, message } = req.body;

    if (!senderEmail || !receiverEmail || !amount) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const newRequest = await Request.create({
      senderEmail,
      receiverEmail,
      amount,
      category,
      dueDate,
      message,
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update request status (Approved/Declined) + TransactionHistory
export const updateRequestStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId, status } = req.body;

    const request = await Request.findById(requestId).session(session);
    if (!request) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const sender = await User.findOne({ email: request.senderEmail }).session(session);
    const receiver = await User.findOne({ email: request.receiverEmail }).session(session);

    if (!sender || !receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Sender or Receiver not found" });
    }

    if (status === "Approved") {
      if (receiver.balance < request.amount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Insufficient balance to approve this request",
        });
      }

      // ✅ Update balances
      receiver.balance -= request.amount;
      sender.balance += request.amount;
      await receiver.save({ session });
      await sender.save({ session });

      // ✅ Save transaction history for both users
      await addTransaction(
        {
          userId: receiver._id,
          type: "sendmoney",
          amount: request.amount,
          meta: {
            toUserEmail: sender.email,
            category: request.category,
            requestId: request._id,
          },
          status: "completed",
        },
        session
      );

      await addTransaction(
        {
          userId: sender._id,
          type: "addmoney",
          amount: request.amount,
          meta: {
            fromUserEmail: receiver.email,
            category: request.category,
            requestId: request._id,
          },
          status: "completed",
        },
        session
      );

      // ✅ Update request status
      request.status = "Approved";
      await request.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Request approved successfully",
        data: request,
      });
    }

    if (status === "Declined") {
      request.status = "Declined";
      await request.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Request declined",
        data: request,
      });
    }

    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: "Invalid status" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating request status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
