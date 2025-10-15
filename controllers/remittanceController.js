import User from "../models/userModel.js";
import Remittance from "../models/RemittanceModel.js";

// Dummy exchange rate (later API / real-time use করতে পারবে)
const exchangeRates = {
  BDT: { USD: 0.0083, BDT: 1 },
  USD: { BDT: 120, USD: 1 }
};

// Send money API
export const sendRemittance = async (req, res) => {
  try {
    const { senderEmail, receiverEmail, amount } = req.body;

    // Validation
    if (!senderEmail || !receiverEmail || amount == null || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Exchange rate check
    const rate = exchangeRates[sender.currency]?.[receiver.currency];
    if (!rate) {
      return res.status(400).json({ success: false, message: "Exchange rate not available" });
    }

    const amountReceived = parseFloat((amount * rate).toFixed(2));

    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Update balances
    sender.balance -= amount;
    receiver.balance += amountReceived;

    await sender.save();
    await receiver.save();

    // Save remittance history
    const remittance = await Remittance.create({
      senderEmail,
      receiverEmail,
      amountSent: amount,
      amountReceived,
      fromCurrency: sender.currency,
      toCurrency: receiver.currency,
       rateUsed: rate,   
      status: "Completed"
    });

    return res.status(200).json({
      success: true,
      data: {
        remittanceId: remittance._id,
        amountSent: amount,
        amountReceived,
        fromCurrency: sender.currency,
        toCurrency: receiver.currency
      }
    });

  } catch (err) {
    console.error("Remittance error:", err);
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
