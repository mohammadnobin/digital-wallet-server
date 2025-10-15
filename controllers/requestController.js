
import Request from "../models/Request.js";
import User from "../models/userModel.js"; // ধরে নিলাম User মডেল আছে

// সব request দেখার জন্য (user perspective)
export const getUserRequests = async (req, res) => {
  try {
    const email = req.query.email; // ইউজারের email

    // Pending requests যেখানে receiver
    const pending = await Request.find({ receiverEmail: email, status: "Pending" }).sort({ createdAt: -1 });

    // History requests (Received / Declined)
    const history = await Request.find({ receiverEmail: email, status: { $in: ["Received","Declined"] } }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { pending, history } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// নতুন request তৈরি করার জন্য
export const createRequest = async (req, res) => {
  try {
    const { senderEmail, receiverEmail, amount, category, dueDate, message } = req.body;

    if (!senderEmail || !receiverEmail || !amount) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const newRequest = await Request.create({
      senderEmail,
      receiverEmail,
      amount,
      category,
      dueDate,
      message,
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// রিকুয়েস্ট Approve / Decline করার জন্য
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (status === "Received") {
      // sender এর balance থেকে টাকা কেটে receiver তে যোগ করা যাবে
      const sender = await User.findOne({ email: request.senderEmail });
      const receiver = await User.findOne({ email: request.receiverEmail });
      if (!sender || !receiver) return res.status(404).json({ success: false, message: "User not found" });

      if (sender.balance < request.amount) {
        return res.status(400).json({ success: false, message: "Sender has insufficient balance" });
      }

      sender.balance -= request.amount;
      receiver.balance += request.amount;

      await sender.save();
      await receiver.save();
    }

    request.status = status;
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};