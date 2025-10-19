// import jwt from "jsonwebtoken";
// import User from "../models/userModel.js";


// export const verifyJWT = async (req, res, next) => {
//   try {
//     const token =
//       req.cookies?.accessToken ||
//       req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized request" });
//     }

//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     const user = await User.findById(decodedToken?._id).select(
//       "-password"
//     );

//     if (!user) {
//       return res.status(401).json({ message: "Invalid access token" });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(401)
//       .json({ message: error?.message || "Invalid access token" });
//   }
// };


import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // 🔹 টোকেন কুকি বা হেডার থেকে নেওয়া হচ্ছে
    const authHeader = req.headers.authorization || req.header("Authorization");
    const token =
      req.cookies?.accessToken ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized request: No token provided" });
    }

    // 🔹 টোকেন যাচাই
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 🔹 ইউজার খুঁজে বের করা
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found for this token" });
    }

    // 🔹 রিকোয়েস্টে ইউজার সেট করা
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: " + (error.message || "Token invalid") });
  }
};
