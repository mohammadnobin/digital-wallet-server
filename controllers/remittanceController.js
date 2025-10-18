import User from "../models/userModel.js";
import Remittance from "../models/RemittanceModel.js";

// Only USD ↔ BDT exchange rates
const exchangeRates = {
  USD: { BDT: 110.45 },
  BDT: { USD: 0.009 }
};

export const sendRemittance = async (req, res) => {
  try {
    const { senderEmail, receiverEmail, amount } = req.body;
    if (!senderEmail || !receiverEmail || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //  Only allow USD ↔ BDT
    if ((sender.currency === "USD" && receiver.currency !== "BDT") ||
        (sender.currency === "BDT" && receiver.currency !== "USD")) {
      return res.status(400).json({ success: false, message: "Only USD ↔ BDT remittance allowed" });
    }

    const rate = exchangeRates[sender.currency][receiver.currency];
    const amountReceived = amount * rate;

    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Update balances
    sender.balance -= amount;
    receiver.balance += amountReceived;

    await sender.save();
    await receiver.save();

    // Save remittance
    await Remittance.create({
      senderEmail,
      receiverEmail,
      amountSent: amount,
      amountReceived,
      fromCurrency: sender.currency,
      toCurrency: receiver.currency,
      rateUsed: rate,
      status: "Completed",
    });

    return res.status(200).json({
      success: true,
      message: "Remittance sent successfully!",
      data: {
        amountSent: amount,
        amountReceived,
        fromCurrency: sender.currency,
        toCurrency: receiver.currency,
        rateUsed: rate,
      },
    });

  } catch (error) {
    console.error("Remittance error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
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
