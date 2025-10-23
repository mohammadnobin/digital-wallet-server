// import mongoose from "mongoose";
// import Request from "../models/RequestModel.js";
// import User from "../models/userModel.js";
// import { addTransaction } from "../helpers/transactionService.js";


// export const createRequest = async (req, res) => {
//   try {
//     const { senderEmail, receiverEmail, amount, category, dueDate, message } = req.body;

//     if (!senderEmail || !receiverEmail || !amount) {
//       return res.status(400).json({ success: false, message: "Required fields missing" });
//     }

//     // ✅ Find sender and receiver users
//     const sender = await User.findOne({ email: senderEmail });
//     const receiver = await User.findOne({ email: receiverEmail });

//     if (!sender || !receiver) {
//       return res.status(404).json({
//         success: false,
//         message: "Sender or Receiver not found",
//       });
//     }

//     // ✅ Create new request
//     const newRequest = await Request.create({
//       senderEmail,
//       receiverEmail,
//       amount,
//       category,
//       dueDate,
//       message,
//       status: "Pending",
//     });

//     // ✅ Add transaction histories using helper
//     await addTransaction({
//       userId: sender._id,
//       type: "request_sent",
//       amount,
//       status: "pending",
//       meta: {
//         toUserEmail: receiver.email,
//         category,
//         requestId: newRequest._id,
//         message: `You sent a money request to ${receiver.email}`,
//       },
//     });

//     await addTransaction({
//       userId: receiver._id,
//       type: "request_received",
//       amount,
//       status: "pending",
//       meta: {
//         fromUserEmail: sender.email,
//         category,
//         requestId: newRequest._id,
//         message: `You received a money request from ${sender.email}`,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Money request created successfully with transaction history",
//       data: newRequest,
//     });
//   } catch (error) {
//     console.error("Error creating request:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const updateRequestStatus = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { requestId, status } = req.body;

//     const request = await Request.findById(requestId).session(session);
//     if (!request) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "Request not found" });
//     }

//     const sender = await User.findOne({ email: request.senderEmail }).session(session);
//     const receiver = await User.findOne({ email: request.receiverEmail }).session(session);

//     if (!sender || !receiver) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "Sender or Receiver not found" });
//     }

//     // ✅ Handle APPROVED
//     if (status === "Approved") {
//       if (receiver.balance < request.amount) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient balance to approve this request",
//         });
//       }

//       // ✅ Update balances
//       receiver.balance -= request.amount;
//       sender.balance += request.amount;
//       await receiver.save({ session });
//       await sender.save({ session });

//       // ✅ Transaction for RECEIVER (money went out)
//       await addTransaction(
//         {
//           userId: receiver._id,
//           type: "request_paid",
//           amount: request.amount,
//           meta: {
//             toUserEmail: sender.email,
//             category: request.category,
//             requestId: request._id,
//             message: "You paid a request",
//           },
//           status: "completed",
//         },
//         session
//       );

//       // ✅ Transaction for SENDER (money received)
//       await addTransaction(
//         {
//           userId: sender._id,
//           type: "request_accepted",
//           amount: request.amount,
//           meta: {
//             fromUserEmail: receiver.email,
//             category: request.category,
//             requestId: request._id,
//             message: "Your money request was approved",
//           },
//           status: "completed",
//         },
//         session
//       );

//       request.status = "Approved";
//       await request.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         success: true,
//         message: "Request approved successfully",
//         data: request,
//       });
//     }

//     // ❌ Handle DECLINED
//     if (status === "Declined") {
//       request.status = "Declined";
//       await request.save({ session });

//       // ✅ Receiver declined (log both sides)
//       await addTransaction(
//         {
//           userId: receiver._id,
//           type: "request_declined",
//           amount: request.amount,
//           meta: {
//             toUserEmail: sender.email,
//             requestId: request._id,
//             message: "You declined a request",
//           },
//           status: "completed",
//         },
//         session
//       );

//       await addTransaction(
//         {
//           userId: sender._id,
//           type: "request_declined",
//           amount: request.amount,
//           meta: {
//             fromUserEmail: receiver.email,
//             requestId: request._id,
//             message: "Your request was declined",
//           },
//           status: "completed",
//         },
//         session
//       );

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         success: true,
//         message: "Request declined successfully",
//         data: request,
//       });
//     }

//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ success: false, message: "Invalid status" });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating request status:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };






import mongoose from "mongoose";
import Request from "../models/RequestModel.js";
import User from "../models/userModel.js";
import { addTransaction } from "../helpers/transactionService.js";

// ✅ Create a money request
export const createRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderEmail, receiverEmail, amount, category, dueDate, message } = req.body;

    if (!senderEmail || !receiverEmail || !amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const sender = await User.findOne({ email: senderEmail }).session(session);
    const receiver = await User.findOne({ email: receiverEmail }).session(session);

    if (!sender || !receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Sender or Receiver not found" });
    }

    // Create new request
    const newRequest = await Request.create(
      [
        {
          senderEmail,
          receiverEmail,
          amount,
          category,
          dueDate,
          message,
          status: "Pending",
        },
      ],
      { session }
    );

    // ✅ Single addTransaction for request creation
    await addTransaction(
      {
        senderId: sender._id,
        receiverId: receiver._id,
        type: "request_created",
        amount,
        status: "pending",
        meta: {
          fromUserEmail: sender.email,
          toUserEmail: receiver.email,
          category,
          requestId: newRequest[0]._id,
          messageSender: `You sent a money request to ${receiver.email}`,
          messageReceiver: `You received a money request from ${sender.email}`,
        },
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Money request created successfully with transaction history",
      data: newRequest[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update request status (Approved / Declined)
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

    // Approved
    if (status === "Approved") {
      if (receiver.balance < request.amount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Insufficient balance to approve this request",
        });
      }

      // Save previous balances
      const receiverBalanceBefore = receiver.balance;
      const senderBalanceBefore = sender.balance;

      // Update balances
      receiver.balance -= request.amount;
      sender.balance += request.amount;

      await receiver.save({ session });
      await sender.save({ session });

      // ✅ Single addTransaction call for approval
      await addTransaction(
        {
          senderId: receiver._id,
          receiverId: sender._id,
          type: "request_approved",
          amount: request.amount,
          status: "completed",
          meta: {
            fromUserEmail: receiver.email,
            toUserEmail: sender.email,
            requestId: request._id,
            category: request.category,
            messageSender: "Your money request was approved",
            messageReceiver: "You paid a request",
            senderBalanceBefore,
            receiverBalanceBefore,
          },
        },
        session
      );

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

    // Declined
    if (status === "Declined") {
      request.status = "Declined";
      await request.save({ session });

      // ✅ Single addTransaction call for decline
      await addTransaction(
        {
          senderId: receiver._id,
          receiverId: sender._id,
          type: "request_declined",
          amount: request.amount,
          status: "completed",
          meta: {
            fromUserEmail: receiver.email,
            toUserEmail: sender.email,
            requestId: request._id,
            messageSender: "Your request was declined",
            messageReceiver: "You declined a request",
          },
        },
        session
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: "Request declined successfully",
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
// export const createRequest = async (req, res) => {
//   try {
//     const { senderEmail, receiverEmail, amount, category, dueDate, message } = req.body;

//     if (!senderEmail || !receiverEmail || !amount) {
//       return res.status(400).json({ success: false, message: "Required fields missing" });
//     }

//     const newRequest = await Request.create({
//       senderEmail,
//       receiverEmail,
//       amount,
//       category,
//       dueDate,
//       message,
//     });

//     res.status(201).json({ success: true, data: newRequest });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// ✅ Update request status (Approved/Declined) + TransactionHistory
// export const updateRequestStatus = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { requestId, status } = req.body;

//     const request = await Request.findById(requestId).session(session);
//     if (!request) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "Request not found" });
//     }

//     const sender = await User.findOne({ email: request.senderEmail }).session(session);
//     const receiver = await User.findOne({ email: request.receiverEmail }).session(session);

//     if (!sender || !receiver) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "Sender or Receiver not found" });
//     }

//     if (status === "Approved") {
//       if (receiver.balance < request.amount) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           success: false,
//           message: "Insufficient balance to approve this request",
//         });
//       }

//       // ✅ Update balances
//       receiver.balance -= request.amount;
//       sender.balance += request.amount;
//       await receiver.save({ session });
//       await sender.save({ session });

//       // ✅ Save transaction history for both users
//       await addTransaction(
//         {
//           userId: receiver._id,
//           type: "incoming request",
//           amount: request.amount,
//           meta: {
//             toUserEmail: sender.email,
//             category: request.category,
//             requestId: request._id,
//           },
//           status: "completed",
//         },
//         session
//       );

//       await addTransaction(
//         {
//           userId: sender._id,
//           type: "request accepted",
//           amount: request.amount,
//           meta: {
//             fromUserEmail: receiver.email,
//             category: request.category,
//             requestId: request._id,
//           },
//           status: "completed",
//         },
//         session
//       );

//       // ✅ Update request status
//       request.status = "Approved";
//       await request.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         success: true,
//         message: "Request approved successfully",
//         data: request,
//       });
//     }

//     if (status === "Declined") {
//       request.status = "Declined";
//       await request.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         success: true,
//         message: "Request declined",
//         data: request,
//       });
//     }

//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ success: false, message: "Invalid status" });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating request status:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



