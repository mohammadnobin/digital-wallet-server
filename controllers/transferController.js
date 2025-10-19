import Transfer from "../models/transferModel.js";

// Create new transfer
export const sendMoney = async (req, res) => {
  try {
    const { senderEmail, recipientEmail, amount, speed, message } = req.body;

    if (!senderEmail || !recipientEmail || !amount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Fee logic (example)
    const fee = speed === "instant" ? 1.99 : 0;

    const transfer = new Transfer({
      senderEmail,
      recipientEmail,
      amount,
      speed,
      message,
      fee,
      status: "completed",
    });

    await transfer.save();
    res.status(201).json({
      message: "Money transfer successful!",
      transfer,
    });
  } catch (error) {
    console.error("Send money error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get transfers by user email
export const getTransfersByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const transfers = await Transfer.find({
      $or: [{ senderEmail: email }, { recipientEmail: email }],
    }).sort({ createdAt: -1 });

    res.status(200).json(transfers);
  } catch (error) {
    console.error("Get transfers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
