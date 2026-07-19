const jwt    = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { COOKIE_NAME } = require("../middleware/requireAuth");

// Never-expiring admin token: 100 years
const COOKIE_MAX_AGE_MS = 100 * 365 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  };
}

function adminSecret() {
  return process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
}

exports.login = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (email !== process.env.DASHBOARD_EMAIL) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const storedPassword = process.env.DASHBOARD_PASSWORD || "";
  // Support both bcrypt hash and plain-text password (migration path)
  const passwordMatches = storedPassword.startsWith("$2")
    ? await bcrypt.compare(password, storedPassword)
    : password === storedPassword;

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = jwt.sign({ role: "admin" }, adminSecret());
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ success: true, token });
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ success: true });
};

exports.me = (req, res) => {
  res.json({ authenticated: true });
};
