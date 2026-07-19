const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE = "legatee_user_token";

module.exports = async function requireUser(req, res, next) {
  try {
    const bearer = req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = bearer || req.cookies?.[COOKIE];
    if (!token) return res.status(401).json({ message: "Not authenticated." });

    const payload = jwt.verify(token, process.env.JWT_USER_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("tokenVersion").lean();

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Not authenticated." });
  }
};
