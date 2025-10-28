import mongoose from "mongoose";
import User from "../models/userModel.js";
import { addTransaction } from "../helpers/transactionService.js";

// 🟢 Add Money Controller
export const addMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, amount, method, details } = req.body;

    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // ✅ Find user
    const userDemo = await User.findOne({ email: user }).session(session);
    if (!userDemo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Save previous balance
    const balanceBefore = userDemo.balance;

    // ✅ Update balance
    userDemo.balance += addAmount;
    await userDemo.save({ session });
const io = req.app.get("io");
    // ✅ Save transaction
    const transaction = await addTransaction(
      {
        senderId: userDemo._id, // same user
        receiverId: userDemo._id, // self transaction
        type: "addmoney",
        amount: addAmount,
        currency: userDemo.currency || "BDT",
        status: "completed",
        meta: {
          method,
          details,
        },
      },
      session, io
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Money added successfully",
      transaction,
      updatedBalance: userDemo.balance,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔴 Cashout Controller
export const cashout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, amount, method, details } = req.body;

    const cashoutAmount = parseFloat(amount);
    if (isNaN(cashoutAmount) || cashoutAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const userDemo = await User.findOne({ email: user }).session(session);
    if (!userDemo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    if (userDemo.balance < cashoutAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // ✅ Fee calculation
    let fee = 0;
    if (method === "card") fee = (cashoutAmount * 2.5) / 100;
    if (method === "mobile") fee = (cashoutAmount * 1) / 100;

    const totalDeduct = cashoutAmount + fee;

    // ✅ Save previous balance
    const balanceBefore = userDemo.balance;

    // ✅ Update balance
    userDemo.balance -= totalDeduct;
    await userDemo.save({ session });
const io = req.app.get("io");
    // ✅ Add Transaction Record
    const transaction = await addTransaction(
      {
        senderId: userDemo._id,
        receiverId: null, // cashout → system account
        type: "cashout",
        amount: cashoutAmount,
        currency: userDemo.currency || "BDT",
        status: "completed",
        meta: {
          method,
          details,
          fee,
        },
      },
      session, io
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Cashout successful",
      transaction,
      remainingBalance: userDemo.balance,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const current = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "UserId is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const data = {
      success: true,
      data: {
        email: user.email,
        balance: user.balance,
      },
    };

    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
