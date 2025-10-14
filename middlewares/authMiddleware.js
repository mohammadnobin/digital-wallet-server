import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ message: error?.message || "Invalid access token" });
  }
};
