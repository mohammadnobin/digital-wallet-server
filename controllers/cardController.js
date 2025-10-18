// import Card from "../models/cardModel.js";

// export const addCard = async (req, res) => {
//   try {
//     const { cardNumber, holderName, expiryDate, cvv } = req.body;

//     if (!cardNumber || !holderName || !expiryDate || !cvv) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const newCard = await Card.create({
//       userId: req.user._id,
//       cardNumber,
//       holderName,
//       expiryDate,
//       cvv,
//     });

//     res.status(201).json({
//       message: "Card added successfully",
//       card: newCard,
//     });
//   } catch (error) {
//     console.error("Error adding card:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getMyCards = async (req, res) => {
//   try {
//     const cards = await Card.find({ userId: req.user._id });
//     res.status(200).json(cards);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch cards" });
//   }
// };


// controllers/cardsController.js
import Card from "../models/cardModel.js";

export const getMyCards = async (req, res) => {
  try {
    const userId = req.user._id; // ensure req.user is set by auth middleware
    const cards = await Card.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return res.json(cards);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cardName, cardNumber, expiryDate, cardType, balance, bank } = req.body;
    if (!cardName || !cardNumber || !expiryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const card = new Card({
      user: userId,
      cardName,
      cardNumber,
      expiryDate,
      cardType,
      balance: Number(balance) || 0,
      meta: { bank, last4: cardNumber.slice(-4) },
    });
    await card.save();
    // remove cardNumber raw when returning? here returning full, but consider removing sensitive fields
    const obj = card.toObject();
    delete obj.cardNumber; // safer to not send full number
    obj._id = card._id;
    return res.status(201).json(obj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const cardId = req.params.id;
    const payload = { ...req.body };
    // Prevent changing owner
    delete payload.user;
    const card = await Card.findOneAndUpdate({ _id: cardId, user: userId }, payload, { new: true });
    if (!card) return res.status(404).json({ message: "Card not found" });
    const obj = card.toObject();
    delete obj.cardNumber;
    return res.json(obj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const cardId = req.params.id;
    const deleted = await Card.findOneAndDelete({ _id: cardId, user: userId });
    if (!deleted) return res.status(404).json({ message: "Card not found" });
    return res.json({ message: "Card deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
