// import mongoose from "mongoose";
// import Transfer from "../models/transferModel.js";
// import User from "../models/userModel.js";
// import { addTransaction } from "../helpers/transactionService.js";

// export const sendMoney = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { senderEmail, recipientEmail, amount, speed, message } = req.body;

//     if (!senderEmail || !recipientEmail || !amount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     const sender = await User.findOne({ email: senderEmail }).session(session);
//     const recipient = await User.findOne({ email: recipientEmail }).session(session);

//     if (!sender || !recipient) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Sender or recipient not found." });
//     }

//     const fee = speed === "instant" ? 1.99 : 0;
//     const totalDeduct = parseFloat(amount) + fee;

//     if (sender.balance < totalDeduct) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Insufficient balance." });
//     }

//     // Save previous balances
//     const senderBalanceBefore = sender.balance;
//     const recipientBalanceBefore = recipient.balance;

//     // Update balances
//     sender.balance -= totalDeduct;
//     recipient.balance += parseFloat(amount);

//     await sender.save({ session });
//     await recipient.save({ session });

//     // Save transfer record
//     const transfer = await Transfer.create(
//       [
//         {
//           senderEmail,
//           recipientEmail,
//           amount,
//           speed,
//           message,
//           fee,
//           status: "completed",
//         },
//       ],
//       { session }
//     );

//     // ✅ Unified addTransaction call
//     await addTransaction(
//       {
//         senderId: sender._id,
//         receiverId: recipient._id,
//         type: "sendmoney",
//         amount: parseFloat(amount),
//         status: "completed",
//         meta: {
//           toUserEmail: recipient.email,
//           fromUserEmail: sender.email,
//           fee,
//           speed,
//           transferId: transfer[0]._id,
//           senderBalanceBefore,
//           recipientBalanceBefore,
//         },
//       },
//       session
//     );

//     // Commit transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       message: `Successfully sent $${amount} to ${recipientEmail}`,
//       transfer: transfer[0],
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getTransfersByEmail = async (req, res) => {
//   try {
//     const email = req.user?.email;

//     if (!email) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: Email missing in token." });
//     }

//     const transfers = await Transfer.find({
//       $or: [{ senderEmail: email }, { recipientEmail: email }],
//     }).sort({ createdAt: -1 });

//     res.status(200).json(transfers);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



// controllers/transferController.js
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

    if (!sender || !recipient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sender or recipient not found." });
    }

    const fee = speed === "instant" ? 1.99 : 0;
    const totalDeduct = parseFloat(amount) + fee;

    if (sender.balance < totalDeduct) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // Save previous balances
    const senderBalanceBefore = sender.balance;
    const recipientBalanceBefore = recipient.balance;

    // Update balances
    sender.balance -= totalDeduct;
    recipient.balance += parseFloat(amount);

    await sender.save({ session });
    await recipient.save({ session });

    // Save transfer record
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

    // Add transaction logs
const io = req.app.get("io");

await addTransaction(
  {
    senderId: sender._id,
    receiverId: recipient._id,
    type: "sendmoney",
    amount: parseFloat(amount),
    status: "completed",
    meta: {
      toUserEmail: recipient.email,
      fromUserEmail: sender.email,
      fee,
      speed,
      transferId: transfer[0]._id,
      senderBalanceBefore,
      recipientBalanceBefore,
    },
  },
  session,
  io // pass io here
);

    // Commit
    await session.commitTransaction();
    session.endSession();

    // ✅ Socket.IO Real-time emit


    // Sender update
    io.to(senderEmail).emit("transferUpdate", {
      type: "sent",
      data: transfer[0],
      message: `You sent $${amount} to ${recipientEmail}`,
    });

    // Receiver update
    io.to(recipientEmail).emit("transferUpdate", {
      type: "received",
      data: transfer[0],
      message: `You received $${amount} from ${senderEmail}`,
    });

    res.status(201).json({
      message: `Successfully sent $${amount} to ${recipientEmail}`,
      transfer: transfer[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transfer Error:", error);
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
