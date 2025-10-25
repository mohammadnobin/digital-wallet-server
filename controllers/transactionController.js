// controllers/transactionController.js
import mongoose from "mongoose";
import TransactionHistory from "../models/TransactionModel.js";
import User from "../models/userModel.js";


// Admin fetch all transactions with pagination
// export const getAllTransactions = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const transactions = await TransactionHistory.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await TransactionHistory.countDocuments();

//     res.status(200).json({
//       success: true,
//       total,
//       page,
//       limit,
//       transactions,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// export const getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await TransactionHistory.find()
//       .populate("senderId", "name email photo")
//       .populate("receiverId", "name email photo")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       message: "All transactions fetched successfully",
//       data: transactions,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


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

//     const transactions = await TransactionHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await TransactionHistory.countDocuments({ userId });

//     res.status(200).json({
//       success: true,
//       total,
//       page,
//       limit,
//       transactions,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✅ Filter transactions where user is sender OR receiver
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

    res.status(200).json({
      success: true,
      message: "Your transactions fetched successfully",
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


// export const getTransactionSummary = async (req, res) => {
//   try {
//     const userId = req.user._id; // middleware থেকে user info

//     // সব completed transactions filter
//     const transactions = await TransactionHistory.find({
//       userId: userId,
//       status: "completed"
//     });

//     // total income
//     const totalIncome = transactions
//       .filter(t => t.type === "addmoney" || t.amount > 0)
//       .reduce((sum, t) => sum + t.amount, 0);

//     // total expenses
//     const totalExpenses = transactions
//       .filter(t => t.type !== "addmoney" && t.amount > 0)
//       .reduce((sum, t) => sum + t.amount, 0);

//     // balance
//     const totalBalance = totalIncome - totalExpenses;
//     const totalSaved = totalBalance; // ধরছি saved = balance

//     res.status(200).json({
//       totalBalance,
//       totalIncome,
//       totalExpenses,
//       totalSaved
//     });
//   } catch (error) {

//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



// export const getTransactionSummary = async (req, res) => {
//   try {
//      const userId = req.user?._id;

//     const result = await TransactionHistory.aggregate([
//       {
//         $facet: {
//           income: [
//             { $match: { receiverId: new mongoose.Types.ObjectId(userId), status: "completed" } },
//             { $group: { _id: null, total: { $sum: "$amount" } } },
//           ],
//           expense: [
//             { $match: { senderId: new mongoose.Types.ObjectId(userId), status: "completed" } },
//             { $group: { _id: null, total: { $sum: "$amount" } } },
//           ],
//         },
//       },
//       {
//         $project: {
//           income: { $ifNull: [{ $arrayElemAt: ["$income.total", 0] }, 0] },
//           expense: { $ifNull: [{ $arrayElemAt: ["$expense.total", 0] }, 0] },
//           savings: {
//             $subtract: [
//               { $ifNull: [{ $arrayElemAt: ["$income.total", 0] }, 0] },
//               { $ifNull: [{ $arrayElemAt: ["$expense.total", 0] }, 0] },
//             ],
//           },
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "User summary fetched successfully",
//       data: result[0],
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// export const getTransactionSummary = async (req, res) => {
//   try {
//     // ✅ verifyJWT থেকে ইউজারের আইডি নিলাম
//     const userId = req.user?._id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - User ID missing",
//       });
//     }

//     // ✅ ইউজারের current balance বের করলাম
//     const user = await User.findById(userId).select("balance currency");
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // ✅ Aggregation দিয়ে income / expense / savings বের করলাম
//     const result = await TransactionHistory.aggregate([
//       {
//         $facet: {
//           income: [
//             {
//               $match: {
//                 receiverId: new mongoose.Types.ObjectId(userId),
//                 status: "completed",
//               },
//             },
//             { $group: { _id: null, total: { $sum: "$amount" } } },
//           ],
//           expense: [
//             {
//               $match: {
//                 senderId: new mongoose.Types.ObjectId(userId),
//                 status: "completed",
//               },
//             },
//             { $group: { _id: null, total: { $sum: "$amount" } } },
//           ],
//         },
//       },
//       {
//         $project: {
//           income: { $ifNull: [{ $arrayElemAt: ["$income.total", 0] }, 0] },
//           expense: { $ifNull: [{ $arrayElemAt: ["$expense.total", 0] }, 0] },
//           savings: {
//             $subtract: [
//               { $ifNull: [{ $arrayElemAt: ["$income.total", 0] }, 0] },
//               { $ifNull: [{ $arrayElemAt: ["$expense.total", 0] }, 0] },
//             ],
//           },
//         },
//       },
//     ]);

//     // ✅ Data prepare করলাম frontend এর জন্য
//     const data = result[0] || { income: 0, expense: 0, savings: 0 };

//     res.status(200).json({
//       success: true,
//       message: "User summary fetched successfully",
//       data: {
//         totalBalance: user.balance,
//         totalIncome: data.income,
//         totalExpenses: data.expense,
//         totalSaved: data.savings,
//         currency: user.currency || "BDT",
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


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
