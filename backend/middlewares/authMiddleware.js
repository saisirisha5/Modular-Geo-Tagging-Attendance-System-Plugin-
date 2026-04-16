import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    const userExists = await User.findById(decoded.id).select("_id role");
    if (!userExists) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    req.user.role = userExists.role;
    next();
  } 
  catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyToken;