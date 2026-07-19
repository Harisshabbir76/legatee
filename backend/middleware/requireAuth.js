const jwt = require("jsonwebtoken");

const COOKIE_NAME = "legatee_admin_token";

function requireAuth(req, res, next) {
  const bearer = req.headers?.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = bearer || req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden." });
    }
    next();
  } catch {
    res.status(401).json({ message: "Session expired." });
  }
}

module.exports = requireAuth;
module.exports.COOKIE_NAME = COOKIE_NAME;
