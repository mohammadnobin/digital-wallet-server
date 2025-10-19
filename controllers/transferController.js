// import Transfer from "../models/transferModel.js";

// // Create new transfer
// export const sendMoney = async (req, res) => {
//   try {
//     const { senderEmail, recipientEmail, amount, speed, message } = req.body;

//     if (!senderEmail || !recipientEmail || !amount) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     // Fee logic (example)
//     const fee = speed === "instant" ? 1.99 : 0;

//     const transfer = new Transfer({
//       senderEmail,
//       recipientEmail,
//       amount,
//       speed,
//       message,
//       fee,
//       status: "completed",
//     });

//     await transfer.save();
//     res.status(201).json({
//       message: "Money transfer successful!",
//       transfer,
//     });
//   } catch (error) {
//     console.error("Send money error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get transfers by user email
// export const getTransfersByEmail = async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     const transfers = await Transfer.find({
//       $or: [{ senderEmail: email }, { recipientEmail: email }],
//     }).sort({ createdAt: -1 });

//     res.status(200).json(transfers);
//   } catch (error) {
//     console.error("Get transfers error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



import Transfer from "../models/transferModel.js";
import User from "../models/userModel.js"; // ✅ user model import korte hobe

// 💸 Send Money Controller
export const sendMoney = async (req, res) => {
  try {
    const { senderEmail, recipientEmail, amount, speed, message } = req.body;

    // প্রয়োজনীয় ফিল্ড চেক
    if (!senderEmail || !recipientEmail || !amount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ চেক করো recipient ডাটাবেজে আছে কিনা
    const recipientUser = await User.findOne({ email: recipientEmail });
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient not found or invalid email." });
    }

    // ✅ ফি ক্যালকুলেশন (উদাহরণ)
    const fee = speed === "instant" ? 1.99 : 0;

    // ✅ নতুন ট্রান্সফার তৈরি
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

// 📦 Get Transfers by Logged-in User (JWT থেকে ইমেইল নেওয়া)
export const getTransfersByEmail = async (req, res) => {
  try {
    // ✅ JWT middleware থেকে userEmail আসবে
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ message: "Unauthorized: Email missing in token." });
    }

    // ✅ ওই ইউজারের সব ট্রান্সফার খোঁজা (sender বা recipient)
    const transfers = await Transfer.find({
      $or: [{ senderEmail: email }, { recipientEmail: email }],
    }).sort({ createdAt: -1 });

    res.status(200).json(transfers);
  } catch (error) {
    console.error("Get transfers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
