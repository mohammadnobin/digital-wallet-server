import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/userModel.js";
import { addTransaction } from "../helpers/transactionService.js";

export const addMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, amount, method, details } = req.body;

    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Find the user by email
    const userDemo = await User.findOne({ email: user }).session(session);
    if (!userDemo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Increase user balance
    userDemo.balance += addAmount;
    await userDemo.save({ session });

    // ✅ Add transaction history (using your service)
    const transaction = await addTransaction(
      {
        userId: userDemo._id,
        type: "addmoney",
        amount: addAmount,
        meta: {
          method,
          details,
        },
        status: "completed",
      },
      session
    );

    // ✅ Commit the transaction (Mongo)
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
    console.error("AddMoney Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};





export const cashout = async (req, res) => {
  try {
    const { user, amount, method, details } = req.body;

    // Convert amount to number
    const cashoutAmount = parseFloat(amount);
    if (isNaN(cashoutAmount) || cashoutAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }



    // Find user
    const userDemo = await User.findOne({ email: user });
    if (!userDemo) return res.status(404).json({ message: "User not found" });

    // Check balance
    if (userDemo.balance < cashoutAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance
    userDemo.balance -= cashoutAmount;
    await userDemo.save();

    // Optional: calculate fee
    let fee = 0;
    if (method === "card") fee = (cashoutAmount * 2.5) / 100;
    if (method === "mobile") fee = (cashoutAmount * 1) / 100;

    // Create transaction
    const transaction = await Transaction.create({
      userEmail: user,
      type: "cashout",
      amount: cashoutAmount,
      method,
      details,
      fee,
      status: "completed",
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: "Cashout successful",
      transaction,
      remainingBalance: userDemo.balance,
    });
  } catch (error) {
    console.error("Cashout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const addMoney = async (req, res) => {
//   try {
//     const { user, amount, method, details } = req.body;

//     // Convert amount to number
//     const addAmount = parseFloat(amount);
//     if (isNaN(addAmount) || addAmount <= 0) {
//       return res.status(400).json({ message: "Invalid amount" });
//     }

//     // Debug: check userId received

//     // Find user
//     const userDemo = await User.findOne({ email: user });
//     if (!userDemo) return res.status(404).json({ message: "User not found" });

//     // Increase balance
//     userDemo.balance += addAmount;
//     await userDemo.save();

//     // No fee for addMoney (optional: you can add fee logic if needed)
//     let fee = 0;

//     // Create transaction
//     const transaction = await Transaction.create({
//       userEmail: user,
//       type: "addmoney",
//       amount: addAmount,
//       method,
//       details,
//       fee,
//       status: "completed",
//       createdAt: new Date(),
//     });

//     res.json({
//       success: true,
//       message: "Money added successfully",
//       transaction,
//       updatedBalance: userDemo.balance,
//     });
//   } catch (error) {
//     console.error("AddMoney Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



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
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
