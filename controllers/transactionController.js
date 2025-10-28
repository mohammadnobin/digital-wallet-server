// controllers/transactionController.js
import mongoose from "mongoose";
import TransactionHistory from "../models/TransactionModel.js";
import User from "../models/userModel.js";

export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✅ Fetch transactions with pagination + populate
    const transactions = await TransactionHistory.find()
      .populate("senderId", "name email photo")
      .populate("receiverId", "name email photo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TransactionHistory.countDocuments();

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      total,
      page,
      limit,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// export const getMyTransactions = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // ✅ Filter transactions where user is sender OR receiver
//     const query = {
//       $or: [{ senderId: userId }, { receiverId: userId }],
//     };

//     const transactions = await TransactionHistory.find(query)
//       .populate("senderId", "name email photo")
//       .populate("receiverId", "name email photo")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await TransactionHistory.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       message: "Your transactions fetched successfully",
//       total,
//       page,
//       limit,
//       transactions,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter transactions where user is sender OR receiver
    const query = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    };

    const transactions = await TransactionHistory.find(query)
      .populate("senderId", "name email photo")
      .populate("receiverId", "name email photo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TransactionHistory.countDocuments(query);

    // Format transactions for frontend
    const formattedTransactions = transactions.map((tx) => ({
      _id: tx._id,
      type: tx.type || "Unknown",
      status: tx.status || "Unknown",
      amount: tx.amount || 0,
      currency: tx.currency || "BDT",
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      meta: tx.meta || {},
      senderId: {
        _id: tx.senderId?._id || null,
        name: tx.senderId?.name || tx.meta?.fromUserEmail || "Unknown",
        email: tx.senderId?.email || tx.meta?.fromUserEmail || "Unknown",
        photo: tx.senderId?.photo || "",
      },
      receiverId: {
        _id: tx.receiverId?._id || null,
        name: tx.receiverId?.name || tx.meta?.toUserEmail || "Unknown",
        email: tx.receiverId?.email || tx.meta?.toUserEmail || "Unknown",
        photo: tx.receiverId?.photo || "",
      },
    }));

    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      total,
      page,
      limit,
      transactions: formattedTransactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID missing",
      });
    }

    // Debugging logs


    const user = await User.findById(userId).select("balance currency");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await TransactionHistory.aggregate([
      {
        $facet: {
          income: [
            {
              $match: {
                receiverId: new mongoose.Types.ObjectId(userId),
                status: "completed",
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          expense: [
            {
              $match: {
                senderId: new mongoose.Types.ObjectId(userId),
                status: "completed",
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
        },
      },
      {
        $project: {
          income: { $ifNull: [{ $arrayElemAt: ["$income.total", 0] }, 0] },
          expense: { $ifNull: [{ $arrayElemAt: ["$expense.total", 0] }, 0] },
          savings: {
            $subtract: [
              { $ifNull: [{ $arrayElemAt: ["$income.total", 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ["$expense.total", 0] }, 0] },
            ],
          },
        },
      },
    ]);

    const data = result[0] || { income: 0, expense: 0, savings: 0 };

    res.status(200).json({
      success: true,
      message: "User summary fetched successfully",
      data: {
        totalBalance: user.balance || 0,
        totalIncome: data.income || 0,
        totalExpenses: data.expense || 0,
        totalSaved: data.savings || 0,
        currency: user.currency || "BDT",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
