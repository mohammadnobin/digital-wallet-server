// import User from "../models/userModel.js";
// import Remittance from "../models/RemittanceModel.js";

// // Only USD ↔ BDT exchange rates
// const exchangeRates = {
//   USD: { BDT: 110.45 },
//   BDT: { USD: 0.009 }
// };

// export const sendRemittance = async (req, res) => {
//   try {
//     const { senderEmail, receiverEmail, amount } = req.body;
//     if (!senderEmail || !receiverEmail || !amount) {
//       return res.status(400).json({ success: false, message: "Missing fields" });
//     }

//     const sender = await User.findOne({ email: senderEmail });
//     const receiver = await User.findOne({ email: receiverEmail });

//     if (!sender || !receiver) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     //  Only allow USD ↔ BDT
//     if ((sender.currency === "USD" && receiver.currency !== "BDT") ||
//         (sender.currency === "BDT" && receiver.currency !== "USD")) {
//       return res.status(400).json({ success: false, message: "Only USD ↔ BDT remittance allowed" });
//     }

//     const rate = exchangeRates[sender.currency][receiver.currency];
//     const amountReceived = amount * rate;

//     if (sender.balance < amount) {
//       return res.status(400).json({ success: false, message: "Insufficient balance" });
//     }

//     // Update balances
//     sender.balance -= amount;
//     receiver.balance += amountReceived;

//     await sender.save();
//     await receiver.save();

//     // Save remittance
//     await Remittance.create({
//       senderEmail,
//       receiverEmail,
//       amountSent: amount,
//       amountReceived,
//       fromCurrency: sender.currency,
//       toCurrency: receiver.currency,
//       rateUsed: rate,
//       status: "Completed",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Remittance sent successfully!",
//       data: {
//         amountSent: amount,
//         amountReceived,
//         fromCurrency: sender.currency,
//         toCurrency: receiver.currency,
//         rateUsed: rate,
//       },
//     });

//   } catch (error) {
//     console.error("Remittance error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };



// import mongoose from "mongoose";
// import User from "../models/userModel.js";
// import Remittance from "../models/RemittanceModel.js";
// import { addTransaction } from "../helpers/transactionService.js"; // ✅ Transaction history service

// // ✅ Only USD ↔ BDT exchange rates
// const exchangeRates = {
//   USD: { BDT: 110.45 },
//   BDT: { USD: 0.009 },
// };

// export const sendRemittance = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { senderEmail, receiverEmail, amount } = req.body;

//     if (!senderEmail || !receiverEmail || !amount) {
//       return res.status(400).json({ success: false, message: "Missing fields" });
//     }

//     // ✅ Find both users
//     const sender = await User.findOne({ email: senderEmail }).session(session);
//     const receiver = await User.findOne({ email: receiverEmail }).session(session);

//     if (!sender || !receiver) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // ✅ Only allow USD ↔ BDT transfers
//     if (
//       (sender.currency === "USD" && receiver.currency !== "BDT") ||
//       (sender.currency === "BDT" && receiver.currency !== "USD")
//     ) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Only USD ↔ BDT remittance allowed",
//       });
//     }

//     const rate = exchangeRates[sender.currency][receiver.currency];
//     const amountSent = parseFloat(amount);
//     const amountReceived = parseFloat((amountSent * rate).toFixed(2));

//     if (isNaN(amountSent) || amountSent <= 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ success: false, message: "Invalid amount" });
//     }

//     // ✅ Check sender balance
//     if (sender.balance < amountSent) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ success: false, message: "Insufficient balance" });
//     }

//     // ✅ Update balances
//     sender.balance -= amountSent;
//     receiver.balance += amountReceived;
//     await sender.save({ session });
//     await receiver.save({ session });

//     // ✅ Save remittance record
//     const remittance = await Remittance.create(
//       [
//         {
//           senderEmail,
//           receiverEmail,
//           amountSent,
//           amountReceived,
//           fromCurrency: sender.currency,
//           toCurrency: receiver.currency,
//           rateUsed: rate,
//           status: "Completed",
//         },
//       ],
//       { session }
//     );

//     // ✅ Add transaction history for both users
//     await addTransaction(
//       {
//         userId: sender._id,
//         type: "sendmoney",
//         amount: amountSent,
//         currency: sender.currency,
//         meta: {
//           receiverEmail,
//           rate,
//           toCurrency: receiver.currency,
//           amountReceived,
//           remittanceId: remittance[0]._id,
//         },
//         status: "completed",
//       },
//       session
//     );

//     await addTransaction(
//       {
//         userId: receiver._id,
//         type: "addmoney",
//         amount: amountReceived,
//         currency: receiver.currency,
//         meta: {
//           senderEmail,
//           rate,
//           fromCurrency: sender.currency,
//           amountSent,
//           remittanceId: remittance[0]._id,
//         },
//         status: "completed",
//       },
//       session
//     );

//     // ✅ Commit transaction
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       success: true,
//       message: "Remittance sent successfully!",
//       data: {
//         amountSent,
//         amountReceived,
//         fromCurrency: sender.currency,
//         toCurrency: receiver.currency,
//         rateUsed: rate,
//       },
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Remittance error:", error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };



import mongoose from "mongoose";
import User from "../models/userModel.js";
import Remittance from "../models/RemittanceModel.js";
import { addTransaction } from "../helpers/transactionService.js";

// ✅ Only USD ↔ BDT exchange rates
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

    // ✅ Find both users
    const sender = await User.findOne({ email: senderEmail }).session(session);
    const receiver = await User.findOne({ email: receiverEmail }).session(session);

    if (!sender || !receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Only USD ↔ BDT transfers
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

    // ✅ Check sender balance
    if (sender.balance < amountSent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // ✅ Save previous balances for transaction
    const senderBalanceBefore = sender.balance;
    const receiverBalanceBefore = receiver.balance;

    // ✅ Update balances
    sender.balance -= amountSent;
    receiver.balance += amountReceived;

    await sender.save({ session });
    await receiver.save({ session });

    // ✅ Save remittance record
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

    // ✅ Add transaction record
    await addTransaction(
      {
        senderId: sender._id,
        receiverId: receiver._id,
        type: "sendmoney",
        amount: amountSent,
        currency: sender.currency,
        status: "completed",
        senderBalanceBefore,
        senderBalanceAfter: sender.balance,
        receiverBalanceBefore,
        receiverBalanceAfter: receiver.balance,
        meta: {
          rate,
          fromCurrency: sender.currency,
          toCurrency: receiver.currency,
          amountSent,
          amountReceived,
          remittanceId: remittance[0]._id,
        },
      },
      session
    );

    // ✅ Commit transaction
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
    console.error("Remittance error:", error);
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
