const jwt        = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User       = require("../models/User");
const OtpStore   = require("../models/OtpStore");

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.BUSINESS_EMAIL, pass: process.env.EMAIL_PASS },
});

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    // Always respond ok to prevent email enumeration
    if (!user) return res.json({ success: true });

    const otp = String(Math.floor(10000 + Math.random() * 90000));
    await OtpStore.findOneAndUpdate(
      { email },
      { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true }
    );

    await mailer.sendMail({
      from: `"Legatee" <${process.env.BUSINESS_EMAIL}>`,
      to: email,
      subject: "Your LEGATEE Password Reset Code",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#F8F2ED;padding:32px 16px;">
          <div style="background:#3B1814;padding:24px 32px;text-align:center;">
            <p style="margin:0;color:#F8F2ED;font-size:20px;letter-spacing:0.22em;">LEGATEE</p>
          </div>
          <div style="background:#fff;padding:32px;">
            <p style="color:#3B1814;font-size:16px;margin:0 0 12px;">Password Reset Code</p>
            <p style="color:#6f6459;font-size:13px;margin:0 0 24px;">Use the code below to reset your password. It expires in 10 minutes.</p>
            <div style="text-align:center;background:#F8F2ED;padding:20px;letter-spacing:0.3em;font-size:32px;font-weight:700;color:#3B1814;">${otp}</div>
            <p style="color:#6f6459;font-size:11px;margin:20px 0 0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>`,
    });

    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.verifyOtp = async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const { otp } = req.body;
  const entry = await OtpStore.findOne({ email });
  if (!entry || entry.otp !== String(otp) || new Date() > entry.expiresAt) {
    return res.status(400).json({ message: "Invalid or expired code." });
  }
  res.json({ success: true });
};

exports.resetPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const { otp, password } = req.body;
    const entry = await OtpStore.findOne({ email });
    if (!entry || entry.otp !== String(otp) || new Date() > entry.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    user.password = password;
    await user.save();
    await OtpStore.deleteOne({ email });
    res.json({ success: true });
  } catch (err) { next(err); }
};

const COOKIE = "legatee_user_token";
// Never-expiring user token: 100 years
const COOKIE_MAX_AGE_MS = 100 * 365 * 24 * 60 * 60 * 1000;

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

function userSecret() {
  return process.env.JWT_USER_SECRET || process.env.JWT_SECRET;
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), tokenVersion: user.tokenVersion },
    userSecret()
  );
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists." });

    const user = await User.create({ name: name?.trim() || "", email, password });
    const token = signToken(user);
    res.cookie(COOKIE, token, cookieOpts());
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    res.cookie(COOKIE, token, cookieOpts());
    res.json({ token, user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE);
  res.json({ success: true });
};

exports.logoutAll = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $inc: { tokenVersion: 1 } });
    res.clearCookie(COOKIE);
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: sanitize(user) });
  } catch (err) { next(err); }
};

function sanitize(user) {
  const { password, tokenVersion, __v, ...safe } = user.toObject ? user.toObject() : user;
  safe.id = safe._id?.toString();
  delete safe._id;
  return safe;
}
