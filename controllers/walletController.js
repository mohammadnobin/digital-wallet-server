import Transaction from "../models/Transaction.js";
import User from "../models/userModel.js";
export const cashout = async (req, res) => {
  try {
    const { userId, amount, method, details } = req.body;

    // Convert amount to number
    const cashoutAmount = parseFloat(amount);
    if (isNaN(cashoutAmount) || cashoutAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Debug: check userId received
    console.log("Received userId:", userId);

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check balance
    if (user.balance < cashoutAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance
    user.balance -= cashoutAmount;
    await user.save();

    // Optional: calculate fee
    let fee = 0;
    if (method === "card") fee = (cashoutAmount * 2.5) / 100;
    if (method === "mobile") fee = (cashoutAmount * 1) / 100;

    // Create transaction
    const transaction = await Transaction.create({
      userId,
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
      remainingBalance: user.balance,
    });
  } catch (error) {
    console.error("Cashout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
