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
