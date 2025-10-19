import Transfer from "../models/transferModel.js";
import User from "../models/userModel.js";

export const sendMoney = async (req, res) => {
  try {
    const { senderEmail, recipientEmail, amount, speed, message } = req.body;
    if (!senderEmail || !recipientEmail || !amount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const sender = await User.findOne({ email: senderEmail });
    const recipient = await User.findOne({ email: recipientEmail });

    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }
    if (!recipient) {
      return res
        .status(404)
        .json({ message: "Recipient not found or invalid email." });
    }

    const fee = speed === "instant" ? 1.99 : 0;
    const totalDeduct = parseFloat(amount) + fee;

    if (sender.balance < totalDeduct) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    sender.balance -= totalDeduct;
    recipient.balance += parseFloat(amount);

    const transfer = new Transfer({
      senderEmail,
      recipientEmail,
      amount,
      speed,
      message,
      fee,
      status: "completed",
    });

    await sender.save();
    await recipient.save();
    await transfer.save();

    res.status(201).json({
      message: `Successfully sent $${amount} to ${recipientEmail}`,
      transfer,
    });
  } catch (error) {
    console.error("Send money error:", error);
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
    console.error("Get transfers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
