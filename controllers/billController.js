// controllers/billController.js
import Bill from "../models/billsModel.js";
import mongoose from "mongoose";

/**
 * Create a new bill.
 * body: { title, total, memberIds: [userId,...], date?, category?, notes? }
 * - creator (req.user.id) will be added as member if included in memberIds; otherwise not.
 */
export const createBill = async (req, res) => {
  try {
    const { title, total, memberIds = [], date, category, notes } = req.body;
    if (!title || !total || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "title, total and memberIds (array) are required" });
    }

    // compute equal share
    const perShare = +(total / memberIds.length).toFixed(2);

    const members = memberIds.map(id => ({
      user: mongoose.Types.ObjectId(id),
      share: perShare,
      status: "pending"
    }));

    const bill = new Bill({
      title,
      total,
      members,
      creator: req.user.id,
      date: date ? new Date(date) : Date.now(),
      category,
      notes
    });

    await bill.save();
    return res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get bills related to current user (where user is a member)
 * optional query: ?tab=all|pending|settled
 */
export const getMyBills = async (req, res) => {
  try {
    const tab = req.query.tab || "all";
    // find bills where members.user == req.user.id
    const bills = await Bill.find({ "members.user": req.user.id })
      .populate("creator", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    // filter by tab
    const filtered = bills.filter(b => {
      if (tab === "all") return true;
      if (tab === "pending") {
        return b.members.some(m => m.user._id.toString() === req.user.id && m.status === "pending");
      }
      if (tab === "settled") {
        return b.members.some(m => m.user._id.toString() === req.user.id && (m.status === "paid" || m.status === "settled"));
      }
      return true;
    });

    // transform to include "yourShare" for frontend convenience
    const transformed = filtered.map(b => {
      const member = b.members.find(m => m.user._id.toString() === req.user.id);
      return {
        id: b._id,
        title: b.title,
        total: b.total,
        people: b.members.length,
        date: b.date,
        status: member?.status || "pending",
        yourShare: member?.share || 0,
        creator: b.creator,
        members: b.members
      };
    });

    return res.json(transformed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark current user's share as paid for a bill
 * PATCH /api/bills/:id/pay
 */
export const payMyShare = async (req, res) => {
  try {
    const billId = req.params.id;
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const member = bill.members.find(m => m.user.toString() === req.user.id);
    if (!member) return res.status(403).json({ message: "You are not a member of this bill" });
    if (member.status === "paid") return res.status(400).json({ message: "Already paid" });

    member.status = "paid";
    member.paidAt = new Date();

    // If everyone paid, set bill-level? (optional) here we won't change top-level fields
    await bill.save();
    return res.json({ message: "Paid successful", bill });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get a single bill by id (only if requester is member)
 */
export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members.user", "name email");

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (!bill.members.some(m => m.user._id.toString() === req.user.id)) {
      return res.status(403).json({ message: "Not authorised to view this bill" });
    }

    return res.json(bill);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete bill (only creator or admin)
 */
export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.creator.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    await bill.remove();
    return res.json({ message: "Bill deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Stats for current user (owed, paid, totalBills, activeGroups)
 */
export const getStats = async (req, res) => {
  try {
    const bills = await Bill.find({ "members.user": req.user.id });
    let owed = 0, paid = 0, totalBills = bills.length, activeGroups = new Set();

    bills.forEach(b => {
      const member = b.members.find(m => m.user.toString() === req.user.id);
      if (!member) return;
      if (member.status === "pending") owed += member.share;
      else if (member.status === "paid" || member.status === "settled") paid += member.share;
      // group id could be creator id or bill id; here we count unique creators as groups
      activeGroups.add(b.creator.toString());
    });

    return res.json({
      owed: +owed.toFixed(2),
      paid: +paid.toFixed(2),
      totalBills,
      activeGroups: activeGroups.size
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
