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

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all bills (optional filter by user)
export const getBills = async (req, res) => {
  try {
    const { user } = req.query;
    let query = {};
    if (user) query.createdBy = user;

    const bills = await SplitBill.find(query).sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (err) {

    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Delete bill
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await SplitBill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    await SplitBill.findByIdAndDelete(id);

    res.json({ success: true, message: "Bill deleted successfully", id });
  } catch (err) {

    res.status(500).json({ success: false, message: "Server error" });
  }
};