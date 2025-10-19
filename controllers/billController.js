import SplitBill from "../models/billsModel.js";

// Create new bill
export const createBill = async (req, res) => {
  try {
    const { title, total, people, date, status, icon, createdBy } = req.body;
    if (!title || !total || !people || !date || !createdBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const yourShare = parseFloat(total) / parseInt(people);

    const newBill = await SplitBill.create({
      title,
      total,
      people,
      date,
      status: status || "pending",
      yourShare,
      icon: icon || "Utensils",
      createdBy,
    });

    res.status(201).json({ success: true, bill: newBill });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all bills (optional filter by user)
export const getBills = async (req, res) => {
  try {
    const { user } = req.query; // email
    let query = {};
    if (user) query.createdBy = user;

    const bills = await SplitBill.find(query).sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
