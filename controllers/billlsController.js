import mongoose from "mongoose";
import { Bill } from "../models/billModel.js";
import User from "../models/userModel.js";
import { addTransaction } from "../helpers/transactionService.js"; 

// ✅ Add new Bill
// export const addBill = async (req, res) => {
//   try {
//     const bill = new Bill(req.body);
//     await bill.save();
//     res.status(201).json({ success: true, message: "Bill added successfully", bill });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const addBill = async (req, res) => {
  try {
    const { name, company, amount, dueDate, autoPay, color, icon, userEmail } = req.body;

    // ✅ Validation check
    if (!name || !company || !amount || !dueDate || !userEmail) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    const bill = new Bill({
      name,
      company,
      amount,
      dueDate,
      autoPay: autoPay || false,
      color: color || "bg-blue-500",
      icon: icon || "Zap",
      userEmail,
      status: "pending", // default status
    });

    await bill.save();

    return res.status(201).json({
      success: true,
      message: "Bill added successfully",
      bill,
    });
  } catch (error) {
    console.error("Error adding bill:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while adding bill",
    });
  }
};

// controllers/billController.js
export const getBills = async (req, res) => {
  try {
    // JWT থেকে auth middleware দিয়ে req.user.set করা থাকবে
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // শুধু এই ইউজারের bill নাও
    const bills = await Bill.find({ userEmail: email });

    res.status(200).json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Delete Bill
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    await Bill.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Bill (e.g., autoPay, status)
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Bill.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, bill: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const payBill = async (req, res) => {
//   try {
//     const { id } = req.params; // bill id
//     const {email} = req.user; 

//     // 1️⃣ Bill খুঁজে বের করা
//     const bill = await Bill.findById(id);
//     if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
//     if (bill.status === "paid") return res.status(400).json({ success: false, message: "Bill already paid" });

//     // 2️⃣ User balance check
//     const user = await User.findOne({ email: email });
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     if (user.balance < bill.amount) return res.status(400).json({ success: false, message: "Insufficient balance" });

//     // 3️⃣ Balance কমানো এবং Bill update করা
//     user.balance -= bill.amount;
//     await user.save();

//     bill.status = "paid";
//     bill.daysOverdue = 0;
//     await bill.save();

//     res.status(200).json({ success: true, message: "Bill paid successfully", bill, userBalance: user.balance });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
export const payBill = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // bill id
    const { email } = req.user; // logged-in user

    // 1️⃣ Bill খুঁজে বের করা
    const bill = await Bill.findById(id).session(session);
    if (!bill) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Bill not found" });
    }
    if (bill.status === "paid") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Bill already paid" });
    }

    // 2️⃣ User balance check
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.balance < bill.amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // 3️⃣ Balance কমানো এবং Bill update করা
    user.balance -= bill.amount;
    await user.save({ session });

    bill.status = "paid";
    bill.daysOverdue = 0;
    await bill.save({ session });

    // 4️⃣ Transaction history add করা
    await addTransaction(
      {
        userId: user._id,
        type: "bill_payment",
        amount: bill.amount,
        currency: user.currency || "BDT",
        meta: {
          billId: bill._id,
          billName: bill.name,
          company: bill.company,
          dueDate: bill.dueDate,
        },
        status: "completed",
      },
      session
    );

    // 5️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Bill paid successfully",
      bill,
      userBalance: user.balance
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("PayBill error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};