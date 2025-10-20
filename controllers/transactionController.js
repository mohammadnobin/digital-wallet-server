// controllers/transactionController.js
import TransactionHistory from "../models/TransactionModel.js";

export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id; // auth middleware থেকে আসবে
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await TransactionHistory.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TransactionHistory.countDocuments({ userId });

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user._id; // middleware থেকে user info

    // সব completed transactions filter
    const transactions = await TransactionHistory.find({
      userId: userId,
      status: "completed"
    });

    // total income
    const totalIncome = transactions
      .filter(t => t.type === "addmoney" || t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // total expenses
    const totalExpenses = transactions
      .filter(t => t.type !== "addmoney" && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // balance
    const totalBalance = totalIncome - totalExpenses;
    const totalSaved = totalBalance; // ধরছি saved = balance

    res.status(200).json({
      totalBalance,
      totalIncome,
      totalExpenses,
      totalSaved
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};