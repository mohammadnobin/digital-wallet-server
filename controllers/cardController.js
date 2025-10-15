import Card from "../models/cardModel.js";

export const addCard = async (req, res) => {
  try {
    const { cardNumber, holderName, expiryDate, cvv } = req.body;

    if (!cardNumber || !holderName || !expiryDate || !cvv) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCard = await Card.create({
      userId: req.user._id,
      cardNumber,
      holderName,
      expiryDate,
      cvv,
    });

    res.status(201).json({
      message: "Card added successfully",
      card: newCard,
    });
  } catch (error) {
    console.error("Error adding card:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user._id });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cards" });
  }
};
