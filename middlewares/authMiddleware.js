import admin from "../config/firebase.js";

// Middleware to verify Firebase ID Token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verify error:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verifyFirebaseToken;
