
import Request from "../models/Request.js";
import User from "../models/userModel.js"; // ধরে নিলাম User মডেল আছে

// সব request দেখার জন্য (user perspective)

export const getUserRequests = async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // আমি যাদেরকে request পাঠিয়েছি
    const sent = await Request.find({ senderEmail: email }).sort({ createdAt: -1 });

    // যারা আমাকে request দিয়েছে
    const received = await Request.find({ receiverEmail: email }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { sent, received },
    });
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
    if (!request)
      return res.status(404).json({ success: false, message: "Request not found" });

    // শুধুমাত্র Approved হলে টাকা ট্রান্সফার হবে
    if (status === "Approved") {
      const sender = await User.findOne({ email: request.senderEmail });
      const receiver = await User.findOne({ email: request.receiverEmail });

      if (!sender || !receiver)
        return res
          .status(404)
          .json({ success: false, message: "Sender or Receiver not found" });

      // ✅ Receiver অর্থাৎ current user-এর balance check
      if (receiver.balance < request.amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance to approve this request",
        });
      }

      // 💸 টাকা ট্রান্সফার: receiver → sender
      receiver.balance -= request.amount;
      sender.balance += request.amount;

      await receiver.save();
      await sender.save();

      // status update
      request.status = "Approved";
      await request.save();

      return res.status(200).json({
        success: true,
        message: "Request approved successfully",
        data: request,
      });
    }

    // ❌ Decline করলে শুধু status update হবে
    if (status === "Declined") {
      request.status = "Declined";
      await request.save();

      return res.status(200).json({
        success: true,
        message: "Request declined",
        data: request,
      });
    }

    // অন্য কিছু হলে invalid
    res.status(400).json({ success: false, message: "Invalid status" });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
